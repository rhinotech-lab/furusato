
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb, BUSINESSES, PRODUCTS, MUNICIPALITIES } from '../services/mockDb';
import { 
  FolderSearch, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  MapPin, 
  Tag, 
  ChevronRight, 
  Mail, 
  FileCheck,
  MoreVertical,
  X,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ImageCollection: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMunicipality, setFilterMunicipality] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'received'>('all');

  const allImages = mockDb.getImages();

  const collectionList = useMemo(() => {
    return PRODUCTS.filter(p => {
      const business = BUSINESSES.find(b => b.id === p.business_id);
      if (currentUser?.role === 'municipality_user' && business?.municipality_id !== currentUser.municipality_id) return false;
      if (currentUser?.role === 'business_user' && p.business_id !== currentUser.business_id) return false;

      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           business?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMuni = !filterMunicipality || business?.municipality_id.toString() === filterMunicipality;

      const images = allImages.filter(img => img.product_id === p.id);
      const isReceived = images.length > 0;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'received' && isReceived) || 
                           (filterStatus === 'pending' && !isReceived);

      return matchesSearch && matchesMuni && matchesStatus;
    }).map(p => {
      const business = BUSINESSES.find(b => b.id === p.business_id);
      const images = allImages.filter(img => img.product_id === p.id);
      return { 
        ...p, 
        business, 
        isReceived: images.length > 0,
        lastUpdate: images.length > 0 ? images[0].created_at : null 
      };
    });
  }, [searchTerm, filterMunicipality, filterStatus, allImages, currentUser]);

  const stats = {
    total: collectionList.length,
    pending: collectionList.filter(item => !item.isReceived).length,
    received: collectionList.filter(item => item.isReceived).length
  };

  const basePath = currentUser?.role === 'municipality_user' ? '/municipality' : '/admin';

  return (
    <div className="space-y-6 animate-in fade-in duration-700 h-full flex flex-col">
      <div className="flex justify-between items-end shrink-0">
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-slate-900 tracking-tighter">素材回収状況</h1>
        </div>
        
        <div className="flex gap-3">
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-premium border border-slate-100">
                <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">未回収</p>
                    <p className="text-[15px] font-black text-rose-500 leading-none">{stats.pending}</p>
                </div>
                <div className="w-px h-6 bg-slate-100"></div>
                <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">完了</p>
                    <p className="text-[15px] font-black text-emerald-500 leading-none">{stats.received}</p>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-[1.5rem] shadow-premium border border-slate-100 flex flex-wrap gap-3 items-center shrink-0">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="商品名・事業者名で検索..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none focus:bg-white transition-all text-sm font-bold" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        
        <div className="flex items-center gap-2">
            {currentUser?.role !== 'municipality_user' && (
              <div className="relative w-48">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <select 
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors appearance-none"
                  value={filterMunicipality}
                  onChange={(e) => setFilterMunicipality(e.target.value)}
                >
                  <option value="">全ての自治体</option>
                  {MUNICIPALITIES.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                <button onClick={() => setFilterStatus('all')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${filterStatus === 'all' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>全て</button>
                <button onClick={() => setFilterStatus('pending')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${filterStatus === 'pending' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400'}`}>未回収</button>
                <button onClick={() => setFilterStatus('received')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${filterStatus === 'received' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400'}`}>完了</button>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-premium border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-auto scrollbar-hide flex-1">
          <table className="w-full text-left min-w-[700px] border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr className="bg-white/95 backdrop-blur-sm text-slate-400 shadow-sm">
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 w-28">ステータス</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">対象商品 / 事業者</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-center border-b border-slate-100 w-24">素材提供</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-center border-b border-slate-100 w-28">最終更新</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest w-28 border-b border-slate-100 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {collectionList.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-10 text-center text-slate-300 font-bold">対象の返礼品はありません</td></tr>
              ) : collectionList.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 border-b border-slate-50/50">
                    {item.isReceived ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black border border-emerald-100">
                            <CheckCircle2 size={10} /> 回収済み
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[9px] font-black border border-rose-100 animate-pulse">
                            <Clock size={10} /> 未提出
                        </span>
                    )}
                  </td>
                  <td className="px-6 py-4 border-b border-slate-50/50">
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-900 text-[14px] truncate">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold mt-0.5">{item.business?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center border-b border-slate-50/50">
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black border ${item.has_materials ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                        {item.has_materials ? '提供あり' : '提供なし'}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center border-b border-slate-50/50">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                        {item.lastUpdate ? new Date(item.lastUpdate).toLocaleDateString('ja-JP') : '---'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center border-b border-slate-50/50">
                    <div className="flex items-center justify-center gap-1.5">
                        {!item.isReceived ? (
                            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-[11px] hover:bg-slate-800 transition-all shadow-md active:scale-95 whitespace-nowrap">
                                <UploadCloud size={12} /> 素材登録
                            </button>
                        ) : (
                            <Link to={`${basePath}/images?productId=${item.id}`} className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95 whitespace-nowrap">
                                <FileCheck size={12} /> 案件確認
                            </Link>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[1.5rem] p-5 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl shrink-0">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-accent">
                  <Mail size={18} />
              </div>
              <div className="space-y-0.5">
                  <h3 className="text-[14px] font-black tracking-tight leading-none">未提出事業者へ一括催促</h3>
                  <p className="text-[11px] text-white/40 font-medium">素材未提出の事業者が {stats.pending} 社あります。</p>
              </div>
          </div>
          <button className="px-6 py-2.5 bg-accent text-white rounded-xl font-bold text-[11px] shadow-xl active:scale-95 transition-all whitespace-nowrap">
              催促メールを送信
          </button>
      </div>
    </div>
  );
};
