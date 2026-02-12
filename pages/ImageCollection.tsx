
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
    <div className="space-y-6 animate-in fade-in duration-700 h-full flex flex-col px-2">
      <div className="flex justify-between items-end shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
              <span>アセットマネージャー</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">素材回収状況</h1>
        </div>
        
        <div className="flex gap-4">
            <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl shadow-premium border border-slate-100">
                <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">未回収</p>
                    <p className="text-lg font-black text-rose-500 leading-none">{stats.pending}</p>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">完了</p>
                    <p className="text-lg font-black text-emerald-500 leading-none">{stats.received}</p>
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

      <div className="bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-auto scrollbar-hide flex-1">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-50/80 backdrop-blur-md text-slate-400">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">ステータス</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">対象商品 / 事業者</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center border-b border-slate-100">素材提供</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center border-b border-slate-100">最終更新</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest w-12 border-b border-slate-100 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {collectionList.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-300 font-black">対象の返礼品はありません</td></tr>
              ) : collectionList.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    {item.isReceived ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-100 uppercase tracking-widest">
                            <CheckCircle2 size={12} /> 回収済み
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black border border-rose-100 uppercase tracking-widest animate-pulse">
                            <Clock size={12} /> 未提出
                        </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-[14px] tracking-tight">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{item.business?.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase border ${item.has_materials ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                        {item.has_materials ? '提供あり設定' : '提供なし'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                        {item.lastUpdate ? new Date(item.lastUpdate).toLocaleDateString('ja-JP') : '---'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                        {!item.isReceived ? (
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] hover:bg-slate-800 transition-all shadow-md active:scale-95 whitespace-nowrap">
                                <UploadCloud size={14} /> 素材を登録
                            </button>
                        ) : (
                            <Link to={`${basePath}/images?productId=${item.id}`} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-[10px] hover:bg-slate-50 transition-all shadow-sm">
                                <FileCheck size={14} /> 案件を確認
                            </Link>
                        )}
                        <button className="p-2 text-slate-200 hover:text-slate-600 transition-colors">
                            <MoreVertical size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shrink-0">
          <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-accent">
                  <Mail size={32} />
              </div>
              <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight leading-none mb-1">未提出事業者へ一括催促</h3>
                  <p className="text-xs text-white/40 font-medium">現在、素材未提出の事業者が {stats.pending} 社あります。期日に合わせた自動リマインドを送信できます。</p>
              </div>
          </div>
          <button className="px-10 py-4 bg-accent text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">
              催促メールを送信
          </button>
      </div>
    </div>
  );
};
