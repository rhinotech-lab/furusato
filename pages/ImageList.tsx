
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb, MUNICIPALITIES, BUSINESSES, PRODUCTS } from '../services/mockDb';
import { StatusBadge } from '../components/StatusBadge';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { 
  Search, Plus, Calendar, CheckCircle2, CheckSquare, 
  Square, X, MousePointerClick, ImageIcon, 
  ArrowRight, ExternalLink, Download, FileUp, Loader2, AlertCircle, FileText, Upload, Globe, Hash, ShoppingBag 
} from 'lucide-react';
import { ImageStatus } from '../types';

const STATUS_PRIORITY: Record<ImageStatus, number> = {
  rejected: 0,
  pending_review: 1,
  revising: 2,
  draft: 3,
  approved: 4,
};

export const ImageList: React.FC = () => {
  const { currentUser } = useAuth();
  const { productId: urlProductId } = useParams<{ productId: string }>();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';
  const queryProductId = searchParams.get('productId');
  const productId = urlProductId || queryProductId;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMunicipality, setFilterMunicipality] = useState<string>('');
  const [filterBusiness, setFilterBusiness] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>(initialStatus);
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // YYYY-MM or 'all'

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // CSV Upload States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFilterStatus(searchParams.get('status') || '');
  }, [searchParams]);

  useEffect(() => {
    if (productId) {
        const prod = PRODUCTS.find(p => p.id === Number(productId));
        if (prod) {
            setFilterBusiness(prod.business_id.toString());
            const biz = BUSINESSES.find(b => b.id === prod.business_id);
            if (biz) setFilterMunicipality(biz.municipality_id.toString());
        }
    } else if (currentUser?.role === 'municipality_user') {
        setFilterMunicipality(currentUser.municipality_id!.toString());
    } else if (currentUser?.role === 'business_user') {
        setFilterBusiness(currentUser.business_id!.toString());
        setFilterMunicipality(currentUser.municipality_id?.toString() || '');
    }
  }, [productId, currentUser]);

  const allImages = mockDb.getImages();
  const enrichedImages = useMemo(() => allImages.map(img => {
    const latestVersion = img.versions[img.versions.length - 1];
    const product = mockDb.getProductById(img.product_id);
    const business = product ? mockDb.getBusinessById(product.business_id) : null;
    const municipality = business ? MUNICIPALITIES.find(m => m.id === business.municipality_id) : null;
    const submittedDate = new Date(latestVersion.created_at);
    const monthKey = `${submittedDate.getFullYear()}-${String(submittedDate.getMonth() + 1).padStart(2, '0')}`;
    return { ...img, business, product, latestVersion, monthKey, municipalityName: municipality?.name || '' };
  }), [allImages]);

  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    enrichedImages.forEach(img => months.add(img.monthKey));
    return Array.from(months).sort().reverse();
  }, [enrichedImages]);

  const filteredImages = useMemo(() => enrichedImages.filter(img => {
    if (currentUser?.role === 'municipality_user' && img.business?.municipality_id !== currentUser.municipality_id) return false;
    if (currentUser?.role === 'business_user' && img.product?.business_id !== currentUser.business_id) return false;
    
    if (productId && img.product_id.toString() !== productId) return false;
    if (filterMunicipality && img.business?.municipality_id.toString() !== filterMunicipality) return false;
    if (filterBusiness && img.business?.id.toString() !== filterBusiness) return false;
    if (filterStatus && img.latestVersion.status !== filterStatus) return false;
    if (selectedMonth !== 'all' && img.monthKey !== selectedMonth) return false;
    
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const matchTitle = img.title.toLowerCase().includes(lowerSearch);
      const matchMunicipality = img.municipalityName.toLowerCase().includes(lowerSearch);
      const matchBusiness = img.business?.name.toLowerCase().includes(lowerSearch) || false;
      if (!matchTitle && !matchMunicipality && !matchBusiness) return false;
    }
    
    return true;
  }).sort((a, b) => {
    const priA = STATUS_PRIORITY[a.latestVersion.status];
    const priB = STATUS_PRIORITY[b.latestVersion.status];
    if (priA !== priB) return priA - priB;
    return new Date(b.latestVersion.created_at).getTime() - new Date(a.latestVersion.created_at).getTime();
  }), [enrichedImages, currentUser, productId, filterMunicipality, filterBusiness, filterStatus, selectedMonth, searchTerm]);

  const basePath = currentUser?.role === 'municipality_user' ? '/municipality' : currentUser?.role === 'business_user' ? '/business' : '/admin';
  const isBusinessUser = currentUser?.role === 'business_user';
  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'creator';

  const pendingImages = filteredImages.filter(img => img.latestVersion.status === 'pending_review');
  const allPendingSelected = pendingImages.length > 0 && pendingImages.every(img => selectedIds.has(img.id));

  const toggleSelectAllPending = () => {
    if (allPendingSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingImages.map(img => img.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkApprove = () => {
    const idsToApprove = Array.from(selectedIds);
    idsToApprove.forEach(id => {
      const img = filteredImages.find(i => i.id === id);
      if (img && img.latestVersion.status === 'pending_review') {
        mockDb.updateVersionStatus(img.id, img.latestVersion.id, 'approved');
      }
    });
    setSelectedIds(new Set());
  };

  const downloadImage = async (url: string, filename: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${filename}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let rawFiles: File[] = [];
    if ('target' in e && (e.target as HTMLInputElement).files) {
        rawFiles = Array.from((e.target as HTMLInputElement).files || []);
    } else if ('dataTransfer' in e) {
        e.preventDefault();
        rawFiles = Array.from(e.dataTransfer.files || []);
    }

    if (rawFiles.length === 0) return;

    const csvFile = rawFiles.find(f => f.name.endsWith('.csv'));
    const imageFiles = rawFiles.filter(f => f.type.startsWith('image/'));

    if (!csvFile) {
      alert('CSVファイルが含まれていません。');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);
    setUploadProgress(10);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/);
      const rows = lines.slice(1).filter(line => line.trim() !== '');
      
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const columns = rows[i].split(',').map(c => c.trim());
        
        if (columns.length < 6) {
          failedCount++;
          errors.push(`行 ${i + 2}: 列が足りません。`);
          continue;
        }

        const [productName, bizIdStr, bannerTitle, extUrl, amountStr, imageSource] = columns;
        const bizId = Number(bizIdStr);
        const amount = Number(amountStr) || 0;

        if (!productName || !bannerTitle || isNaN(bizId)) {
          failedCount++;
          errors.push(`行 ${i + 2}: 必須項目が不足しているか、IDが無効です。`);
          continue;
        }

        let imagePath = "https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&q=80";
        const isUrl = imageSource.startsWith('http');

        if (isUrl) {
            imagePath = imageSource;
        } else if (imageSource) {
            const matchedImage = imageFiles.find(f => f.name === imageSource);
            if (matchedImage) {
                imagePath = URL.createObjectURL(matchedImage);
            } else {
                errors.push(`行 ${i + 2}: 指定されたファイル "${imageSource}" が見つかりません。デフォルトを使用します。`);
            }
        }

        const newProduct = mockDb.addProduct({
          name: productName,
          business_id: bizId,
          donation_amount: amount,
          portals: ["rakuten", "choice"]
        });

        mockDb.addImage({
            product_id: newProduct.id,
            title: bannerTitle,
            external_url: extUrl || '',
            created_by_admin_id: currentUser!.id,
            file_path: imagePath
        });
        
        successCount++;
        setUploadProgress(Math.round(10 + ((i + 1) / rows.length) * 90));
        await new Promise(r => setTimeout(r, 50));
      }

      setUploadResult({ success: successCount, failed: failedCount, errors });
      setIsUploading(false);
    };
    reader.readAsText(csvFile);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative pb-24 h-full flex flex-col px-8 lg:px-12 pt-8">
      <div className="flex justify-between items-center shrink-0">
        <div className="flex flex-col">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">案件管理</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 opacity-60">Banner Production Pipeline</p>
        </div>
        
        <div className="flex items-center gap-4">
          {!isBusinessUser && (
            <>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                <FileUp size={18} /> 一括アップロード
              </button>
              <Link to={`${basePath}/images/new`} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                <Plus size={20} /> 新規登録
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="bg-white p-5 rounded-[2rem] shadow-premium border border-slate-100 flex flex-wrap gap-5 items-center shrink-0">
        <div className="relative flex-1 min-w-[350px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="案件名・自治体名で検索..." 
            className="w-full pl-14 pr-5 py-3.5 bg-slate-50 border-0 rounded-2xl outline-none focus:bg-white transition-all text-sm font-bold text-slate-700" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <select className="px-6 py-3.5 bg-slate-50 border-0 rounded-2xl text-[13px] font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100 transition-colors appearance-none min-w-[200px]" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">全てのステータス</option>
          <option value="draft">下書き</option>
          <option value="pending_review">承認待ち</option>
          <option value="approved">承認済み</option>
          <option value="rejected">差し戻し</option>
          <option value="revising">修正中</option>
        </select>
        {pendingImages.length > 0 && (
          <button onClick={toggleSelectAllPending} className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black transition-all border ${allPendingSelected ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-accent border-blue-100 shadow-sm shadow-blue-100/50'}`}>
            <MousePointerClick size={16} /> {allPendingSelected ? '全解除' : `全選択 (${pendingImages.length})`}
          </button>
        )}
      </div>

      <div className="flex items-center gap-6 bg-slate-50/50 px-6 py-3 rounded-[1.5rem] border border-slate-100 shrink-0">
        <div className="flex items-center gap-2 text-slate-400 shrink-0">
          <Calendar size={14} />
          <span className="text-[11px] font-black uppercase tracking-widest opacity-80">提出月</span>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button onClick={() => setSelectedMonth('all')} className={`px-6 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all ${selectedMonth === 'all' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>
            全期間
          </button>
          {monthOptions.map(m => (
            <button key={m} onClick={() => setSelectedMonth(m)} className={`px-6 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all ${selectedMonth === m ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>
              {m.replace('-', '年')}月
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-12">
        {filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-slate-300 gap-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center"><ImageIcon size={48} className="opacity-10" /></div>
              <p className="font-bold text-base tracking-tight">対象の案件が見つかりませんでした</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="sticky top-0 z-20">
                <tr className="bg-slate-50/80 backdrop-blur-md text-slate-400 text-[10px] font-black uppercase tracking-widest shadow-sm">
                  <th className="px-10 py-5 w-16 text-center border-b border-slate-100"></th>
                  <th className="px-2 py-5 w-24 text-center border-b border-slate-100">プレビュー</th>
                  <th className="px-10 py-5 border-b border-slate-100">案件タイトル / 商品情報</th>
                  {isAdmin && <th className="px-10 py-5 border-b border-slate-100">自治体名</th>}
                  <th className="px-10 py-5 border-b border-slate-100">事業者名</th>
                  <th className="px-6 py-5 w-24 border-b border-slate-100 text-center">改修数</th>
                  <th className="px-6 py-5 w-40 border-b border-slate-100 text-center">更新日時</th>
                  <th className="px-6 py-5 w-16 border-b border-slate-100 text-center">URL</th>
                  <th className="px-6 py-5 w-16 border-b border-slate-100 text-center">保存</th>
                  <th className="px-8 py-5 w-36 border-b border-slate-100 text-center">ステータス</th>
                  <th className="px-10 py-5 w-16 border-b border-slate-100"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredImages.map(img => {
                   const isSelected = selectedIds.has(img.id);
                   const municipality = MUNICIPALITIES.find(m => m.id === img.business?.municipality_id);
                   const updateDate = new Date(img.latestVersion.created_at);
                   return (
                    <tr key={img.id} className={`group transition-all ${isSelected ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-10 py-7 text-center">
                         {img.latestVersion.status === 'pending_review' ? (
                           <button onClick={() => toggleSelect(img.id)} className="transition-transform active:scale-90">{isSelected ? <CheckSquare size={22} className="text-accent" /> : <Square size={22} className="text-slate-200" />}</button>
                         ) : <div className="w-6 h-6 mx-auto opacity-5"><Square size={22} /></div>}
                      </td>
                      <td className="px-2 py-7">
                        <div className="w-20 h-12 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 mx-auto shadow-sm group-hover:scale-110 transition-transform">
                           <img src={img.latestVersion.file_path} alt="" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-10 py-7 min-w-[300px]">
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-800 text-[15px] truncate leading-tight mb-1.5 group-hover:text-accent transition-colors">{img.title}</span>
                            <div className="flex items-center gap-2">
                              {img.product && (
                                <Link 
                                  to={`${basePath}/products/${img.product.id}/edit`} 
                                  className="text-[11px] text-slate-400 font-bold uppercase truncate max-w-[220px] hover:text-accent flex items-center gap-1 transition-colors"
                                  title="商品詳細ページへ"
                                >
                                  <ShoppingBag size={10} className="shrink-0" />
                                  {img.product.name}
                                </Link>
                              )}
                              {img.product?.product_code && (
                                <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded flex items-center gap-1 font-mono font-black">
                                  <Hash size={10} /> {img.product.product_code}
                                </span>
                              )}
                            </div>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-10 py-7">
                          <span className="text-xs font-bold text-slate-600 truncate block max-w-[160px]">{municipality?.name || '---'}</span>
                        </td>
                      )}
                      <td className="px-10 py-7">
                        <span className="text-xs font-bold text-slate-600 truncate block max-w-[160px]">{img.business?.name || '---'}</span>
                      </td>
                      <td className="px-6 py-7 text-center">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black border border-slate-100">
                            V{img.versions.length}
                        </div>
                      </td>
                      <td className="px-6 py-7 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-mono font-black text-slate-500 tracking-tighter">
                            {updateDate.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')}
                          </span>
                          <span className="text-[11px] font-mono text-slate-300 font-bold">
                            {updateDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-7 text-center">
                        {img.external_url ? (
                          <a href={img.external_url} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-accent transition-colors block p-2">
                            <ExternalLink size={18} className="mx-auto" />
                          </a>
                        ) : <span className="text-[11px] font-black text-slate-100">---</span>}
                      </td>
                      <td className="px-6 py-7 text-center">
                        <button onClick={(e) => downloadImage(img.latestVersion.file_path, img.title, e)} className="text-slate-200 hover:text-accent transition-colors block p-2 w-full">
                          <Download size={18} className="mx-auto" />
                        </button>
                      </td>
                      <td className="px-8 py-7 text-center"><StatusBadge status={img.latestVersion.status} /></td>
                      <td className="px-10 py-7 text-right">
                        <Link to={`${basePath}/revisions/${img.id}`} className="inline-flex items-center justify-center w-11 h-11 bg-blue-50 text-accent rounded-2xl hover:bg-accent hover:text-white transition-all shadow-sm active:scale-95 group/btn">
                          <ArrowRight size={20} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900 text-white shadow-2xl px-10 py-5 rounded-[2.5rem] flex items-center gap-10 ring-1 ring-white/10 backdrop-blur-md bg-opacity-95">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center font-black text-sm">{selectedIds.size}</div>
              <p className="text-xs font-black whitespace-nowrap uppercase tracking-widest opacity-80">Items Selected</p>
            </div>
            <button onClick={handleBulkApprove} className="flex items-center gap-3 px-10 py-3.5 bg-accent text-white rounded-2xl font-black text-sm hover:bg-sky-500 transition-all active:scale-95 group">
              <CheckCircle2 size={20} /> 選択した案件を一括承認
            </button>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                  <Upload size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">案件一括アップロード</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CSV (URLs or Files) Bulk Import</p>
                </div>
              </div>
              <button onClick={() => { setIsUploadModalOpen(false); setUploadResult(null); }} className="p-2 text-slate-300 hover:text-slate-600 transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="p-10 space-y-8">
              {!isUploading && !uploadResult && (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => { setDragActive(false); handleFilesUpload(e); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all cursor-pointer group ${
                    dragActive ? 'border-accent bg-blue-50/50' : 'border-slate-200 hover:border-accent hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex justify-center gap-4 mb-6">
                    <FileText size={48} className="text-slate-200 group-hover:text-accent transition-all" />
                    <Globe size={48} className="text-slate-200 group-hover:text-accent transition-all" />
                    <ImageIcon size={48} className="text-slate-200 group-hover:text-accent transition-all" />
                  </div>
                  <p className="text-sm font-black text-slate-900 mb-1">CSVデータと画像ファイルをまとめて選択</p>
                  <p className="text-[11px] text-slate-400 font-bold leading-relaxed mb-6">
                    CSV内の画像ソース列に **URL** を記載すれば自動取得されます。<br/>
                    ローカルファイル名を記載した場合は、画像ファイルも同時に選択してください。
                  </p>
                  
                  <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">CSV推奨フォーマット (6列)</p>
                      <code className="text-[10px] font-mono font-bold text-slate-600 block bg-white p-3 rounded-xl border border-slate-100 leading-relaxed shadow-inner">
                        商品名, 事業者ID, 案件タイトル, 外部リンクURL, 寄付金額, <span className="text-accent">画像ソース(URL or ファイル名)</span>
                      </code>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple
                    accept=".csv,image/*" 
                    onChange={handleFilesUpload} 
                  />
                </div>
              )}

              {isUploading && (
                <div className="py-12 text-center space-y-6">
                  <div className="relative inline-block">
                    <Loader2 size={48} className="text-accent animate-spin mx-auto" />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-accent">{uploadProgress}%</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-black text-slate-900 tracking-tight">データをインポート中...</p>
                    <p className="text-xs text-slate-400 font-bold">外部URLからの画像取得と、商品の生成を並行して行っています。</p>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-accent transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {uploadResult && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className={`p-8 rounded-[2rem] border-2 flex items-center gap-6 ${uploadResult.failed === 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${uploadResult.failed === 0 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                      {uploadResult.failed === 0 ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-900 tracking-tight">インポート完了</p>
                      <p className="text-sm font-bold text-slate-600">
                        {uploadResult.success}件の登録に成功しました。
                        {uploadResult.failed > 0 && <span className="text-rose-600 ml-1">{uploadResult.failed}件失敗。</span>}
                      </p>
                    </div>
                  </div>

                  {uploadResult.errors.length > 0 && (
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 max-h-40 overflow-y-auto scrollbar-hide">
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3">処理ログ</p>
                      <ul className="space-y-1">
                        {uploadResult.errors.map((err, i) => (
                          <li key={i} className="text-[11px] font-bold text-slate-400">{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button 
                    onClick={() => { setIsUploadModalOpen(false); setUploadResult(null); }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all"
                  >
                    閉じる
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <a href="#" className="text-[11px] font-black text-accent uppercase tracking-widest hover:underline flex items-center justify-center gap-2">
                <Download size={14} /> テンプレートCSVをダウンロード
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
