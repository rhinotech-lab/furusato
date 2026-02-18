
import React, { useState, useMemo } from 'react';
import { mockDb, BUSINESSES, PORTALS, MUNICIPALITIES, PRODUCTS } from '../services/mockDb';
import { useAuth } from '../context/AuthContext';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Search, Plus, Edit, ArrowRight, ChevronRight, MapPin, Tag, Calendar, ExternalLink, Clock } from 'lucide-react';

export const ProductList: React.FC = () => {
  const { currentUser } = useAuth();
  const { businessId: paramBusinessId } = useParams<{ businessId: string }>();
  const [searchParams] = useSearchParams();
  const businessId = paramBusinessId || searchParams.get('businessId') || '';
  const [filterMunicipality, setFilterMunicipality] = useState('');
  const [filterBusiness, setFilterBusiness] = useState(businessId);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // YYYY-MM or 'all'

  const enrichedProducts = useMemo(() => {
    const allImages = mockDb.getImages();
    return PRODUCTS.map(p => {
      const deadlineDate = p.deadline ? new Date(p.deadline) : null;
      const monthKey = deadlineDate ? `${deadlineDate.getFullYear()}-${String(deadlineDate.getMonth() + 1).padStart(2, '0')}` : 'none';
      
      // 当該商品の最新画像更新日を取得
      const productImages = allImages.filter(img => img.product_id === p.id);
      let lastUpdate: string | null = null;
      if (productImages.length > 0) {
        let maxTime = 0;
        productImages.forEach(img => {
          const latest = img.versions[img.versions.length - 1];
          const time = new Date(latest.created_at).getTime();
          if (time > maxTime) maxTime = time;
        });
        lastUpdate = new Date(maxTime).toISOString().split('T')[0];
      }

      return { ...p, monthKey, lastUpdate };
    });
  }, []);

  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    enrichedProducts.forEach(p => {
      if (p.monthKey !== 'none') months.add(p.monthKey);
    });
    return Array.from(months).sort();
  }, [enrichedProducts]);

  const products = enrichedProducts.filter(p => {
    const business = BUSINESSES.find(b => b.id === p.business_id);
    if (currentUser?.role === 'municipality_user' && business?.municipality_id !== currentUser.municipality_id) return false;
    
    if (filterMunicipality && business?.municipality_id.toString() !== filterMunicipality) return false;
    if (filterBusiness && p.business_id.toString() !== filterBusiness) return false;
    if (selectedMonth !== 'all' && p.monthKey !== selectedMonth) return false;
    
    // 強化された検索フィルター
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(searchLower);
      const matchProdCode = p.product_code?.toLowerCase().includes(searchLower);
      const matchBizName = business?.name.toLowerCase().includes(searchLower);
      const matchBizCode = business?.code.toLowerCase().includes(searchLower);
      
      if (!matchName && !matchProdCode && !matchBizName && !matchBizCode) return false;
    }
    
    return true;
  });

  const businesses = BUSINESSES.filter(b => {
      if (currentUser?.role === 'municipality_user') return b.municipality_id === currentUser.municipality_id;
      if (filterMunicipality) return b.municipality_id.toString() === filterMunicipality;
      return true;
  });

  const basePath = currentUser?.role === 'municipality_user' ? '/municipality' : '/admin';

  return (
    <div className="space-y-6 animate-in fade-in duration-700 h-full flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-slate-900 tracking-tighter">商品一覧</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`${basePath}/products/new`} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl active:scale-95">
            <Plus size={20} /> 新規登録
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-[2rem] shadow-premium border border-slate-100 flex flex-wrap gap-5 items-center shrink-0">
        <div className="relative flex-1 min-w-[350px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="商品名、事業者名、商品コードなどで検索..." 
            className="w-full pl-14 pr-5 py-3 bg-slate-50 border-0 rounded-2xl outline-none focus:bg-white transition-all text-sm font-bold" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        
        <div className="flex items-center gap-3">
            {currentUser?.role !== 'municipality_user' && (
              <div className="relative w-56">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <select 
                  className="w-full pl-11 pr-5 py-3 bg-slate-50 border-0 rounded-2xl text-[13px] font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors appearance-none"
                  value={filterMunicipality}
                  onChange={(e) => {setFilterMunicipality(e.target.value); setFilterBusiness('');}}
                >
                  <option value="">全ての自治体</option>
                  {MUNICIPALITIES.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative w-56">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <select 
                className="w-full pl-11 pr-5 py-3 bg-slate-50 border-0 rounded-2xl text-[13px] font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors appearance-none"
                value={filterBusiness}
                onChange={(e) => setFilterBusiness(e.target.value)}
              >
                <option value="">全ての事業者</option>
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-6 bg-slate-50/50 px-6 py-3 rounded-[1.5rem] border border-slate-100 shrink-0">
        <div className="flex items-center gap-2 text-slate-400 shrink-0">
          <Calendar size={14} />
          <span className="text-[11px] font-black uppercase tracking-widest opacity-80">掲載締切月</span>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setSelectedMonth('all')}
            className={`px-6 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all ${selectedMonth === 'all' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            全期間
          </button>
          {monthOptions.map(m => (
            <button 
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-6 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all ${selectedMonth === m ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {m.replace('-', '年')}月
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-premium border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-auto scrollbar-hide flex-1">
          <table className="w-full text-left min-w-[700px] border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr className="bg-white/95 backdrop-blur-sm text-slate-400 shadow-sm">
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 w-36">商品コード</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">商品名 / 事業者</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-center border-b border-slate-100 w-36">最終画像更新</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest w-24 border-b border-slate-100 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-300 font-bold">対象の商品が見つかりませんでした</td></tr>
              ) : products.map(p => {
                const business = BUSINESSES.find(b => b.id === p.business_id);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 border-b border-slate-50/50">
                      <span className="font-mono text-slate-400 text-[11px] font-bold tracking-wider">#{p.product_code || '---'}</span>
                    </td>
                    <td className="px-6 py-4 border-b border-slate-50/50">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 text-[14px] truncate">{p.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-bold">{business?.name}</span>
                            <span className="text-[9px] text-slate-300 font-mono font-bold">({business?.code})</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center border-b border-slate-50/50">
                        <div className="flex flex-col items-center gap-0.5">
                            {p.lastUpdate ? (
                                <>
                                    <span className="text-[11px] font-mono font-bold text-slate-600">
                                        {p.lastUpdate.replace(/-/g, '/')}
                                    </span>
                                    <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">更新済み</span>
                                </>
                            ) : (
                                <span className="text-[10px] font-bold text-slate-200">未アップロード</span>
                            )}
                        </div>
                    </td>
                    <td className="px-4 py-4 text-center border-b border-slate-50/50">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          to={`${basePath}/products/${p.id}/edit`} 
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95 whitespace-nowrap"
                        >
                          <Edit size={12} />
                          編集
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
