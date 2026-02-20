
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb, BUSINESSES, PRODUCTS, MUNICIPALITIES } from '../services/mockDb';
import { 
  History, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  MapPin, 
  Tag, 
  ChevronRight, 
  MessageSquare, 
  FileCheck,
  MoreVertical,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';

export const ImageRevisionList: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMunicipality, setFilterMunicipality] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const allImages = mockDb.getImages();

  const revisionList = useMemo(() => {
    return allImages.filter(img => {
      const product = mockDb.getProductById(img.product_id);
      const business = product ? mockDb.getBusinessById(product.business_id) : null;
      
      if (currentUser?.role === 'municipality_user' && business?.municipality_id !== currentUser.municipality_id) return false;
      if (currentUser?.role === 'business_user' && product?.business_id !== currentUser.business_id) return false;

      const latestVer = img.versions[img.versions.length - 1];
      const matchesSearch = img.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           product?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMuni = !filterMunicipality || business?.municipality_id.toString() === filterMunicipality;
      const matchesStatus = filterStatus === 'all' || latestVer.status === filterStatus;

      return matchesSearch && matchesMuni && matchesStatus;
    }).map(img => {
      const product = mockDb.getProductById(img.product_id);
      const business = product ? mockDb.getBusinessById(product.business_id) : null;
      const latestVer = img.versions[img.versions.length - 1];
      return { 
        ...img, 
        product, 
        business, 
        latestVer 
      };
    });
  }, [searchTerm, filterMunicipality, filterStatus, allImages, currentUser]);

  const basePath = currentUser?.role === 'municipality_user' ? '/municipality' : currentUser?.role === 'business_user' ? '/business' : '/admin';

  return (
    <div className="space-y-6 animate-in fade-in duration-700 h-full flex flex-col">
      <div className="flex justify-between items-end shrink-0">
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-slate-900 tracking-tighter">画像改修状況</h1>
        </div>
        
        <div className="flex gap-3">
            <div className="bg-white px-5 py-2.5 rounded-2xl shadow-premium border border-slate-100 flex items-center gap-4">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase">進行中の改修</span>
                    <span className="text-lg font-black text-slate-900 leading-none">{revisionList.filter(r => r.latestVer.status !== 'approved').length}</span>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase">全リビジョン</span>
                    <span className="text-lg font-black text-slate-900 leading-none">{revisionList.length}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-[1.5rem] shadow-premium border border-slate-100 flex flex-wrap gap-3 items-center shrink-0">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="プロジェクト名・商品名で検索..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none focus:bg-white transition-all text-sm font-bold" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        
        <div className="flex items-center gap-2">
            <select 
              className="px-4 py-2.5 bg-slate-50 border-0 rounded-xl text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors appearance-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">全てのステータス</option>
              <option value="pending_review">承認待ち</option>
              <option value="rejected">差し戻し</option>
              <option value="revising">修正中</option>
              <option value="approved">承認済み</option>
            </select>

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
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-premium border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-auto scrollbar-hide flex-1">
          <table className="w-full text-left min-w-[700px] border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr className="bg-white/95 backdrop-blur-sm text-slate-400 shadow-sm">
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 w-32">最新ステータス</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">プロジェクトタイトル / 商品</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-center border-b border-slate-100 w-20">版数</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-center border-b border-slate-100 w-28">最終更新</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest w-24 border-b border-slate-100 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {revisionList.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-10 text-center text-slate-300 font-bold">該当する改修プロジェクトはありません</td></tr>
              ) : revisionList.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 border-b border-slate-50/50">
                    <StatusBadge status={item.latestVer.status} />
                  </td>
                  <td className="px-6 py-4 border-b border-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                            <img src={item.latestVer.file_path} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-900 text-[14px] truncate">{item.title}</span>
                            <span className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">{item.product?.name}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center border-b border-slate-50/50">
                    <div className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[9px] font-black border border-slate-100">
                        V{item.versions.length}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center border-b border-slate-50/50">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                        {new Date(item.latestVer.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center border-b border-slate-50/50">
                    <Link to={`${basePath}/revisions/${item.id}`} className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95 whitespace-nowrap">
                        詳細 <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
