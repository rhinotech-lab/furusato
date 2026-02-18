
import React, { useState, useEffect } from 'react';
import { mockDb, MUNICIPALITIES, PORTALS, BUSINESSES, PRODUCTS } from '../services/mockDb';
import { useAuth } from '../context/AuthContext';
import { Link, useParams } from 'react-router-dom';
import { Plus, Edit, Tag, MapPin, Clock, ChevronRight } from 'lucide-react';

export const BusinessList: React.FC = () => {
  const { currentUser } = useAuth();
  const { municipalityId } = useParams<{ municipalityId: string }>();
  const [filterMunicipality, setFilterMunicipality] = useState(municipalityId || '');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    if (municipalityId) {
      setFilterMunicipality(municipalityId);
    }
  }, [municipalityId]);

  const allProducts = mockDb.getProducts();
  const allImages = mockDb.getImages();

  // 特定の事業者の「総数」と「制作中（承認済み以外がある）数」を取得
  const getBusinessStats = (businessId: number) => {
    const products = allProducts.filter(p => p.business_id === businessId);
    const total = products.length;
    
    // 簡易的に：一つでも承認待ち・修正中・差し戻し等の画像がある商品を制作中とする
    const inProduction = products.filter(p => {
        const pImages = allImages.filter(img => img.product_id === p.id);
        if (pImages.length === 0) return true; // 画像がない＝これから制作
        return pImages.some(img => {
            const status = img.versions[img.versions.length - 1].status;
            return status !== 'approved';
        });
    }).length;

    return { total, inProduction };
  };

  // 最終アクティビティ（最新の画像更新やコメント）をモックで表示
  const getLastActivity = (businessId: number) => {
    const dates = [3, 5, 12, 1, 7, 14, 2];
    const day = dates[businessId % dates.length];
    return `${day}日前`;
  };

  const filteredBusinesses = BUSINESSES.filter(b => {
    if (currentUser?.role === 'municipality_user' && b.municipality_id !== currentUser.municipality_id) return false;
    if (filterMunicipality && b.municipality_id.toString() !== filterMunicipality) return false;
    if (filterCategory && b.category !== filterCategory) return false;
    
    return true;
  }).sort((a, b) => getBusinessStats(b.id).total - getBusinessStats(a.id).total);

  const categories = Array.from(new Set(BUSINESSES.map(b => b.category).filter(Boolean)));
  const basePath = currentUser?.role === 'municipality_user' ? '/municipality' : '/admin';
  const isMunicipalityUser = currentUser?.role === 'municipality_user';

  return (
    <div className="space-y-6 animate-in fade-in duration-700 h-full flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-slate-900 tracking-tighter">事業者一覧</h1>
        </div>
        <Link to={`${basePath}/businesses/new`} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-[11px] hover:bg-slate-800 transition-all shadow-md active:scale-95">
          <Plus size={14} /> 新規登録
        </Link>
      </div>

      <div className="bg-white p-1.5 rounded-xl shadow-premium border border-slate-100 flex gap-2 items-center shrink-0">
        {!isMunicipalityUser && (
          <div className="relative w-48 shrink-0">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
            <select 
              className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border-0 rounded-lg text-[11px] font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors appearance-none"
              value={filterMunicipality}
              onChange={(e) => setFilterMunicipality(e.target.value)}
            >
              <option value="">自治体：全て</option>
              {MUNICIPALITIES.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="relative w-40 shrink-0">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
          <select 
            className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border-0 rounded-lg text-[11px] font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors appearance-none"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">カテゴリ：全て</option>
            {categories.map(cat => (
              <option key={cat!} value={cat!}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-premium border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-auto scrollbar-hide flex-1">
          <table className="w-full text-left min-w-[700px] border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr className="bg-white/95 backdrop-blur-sm text-slate-400 shadow-sm">
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">1. 事業者情報</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-center border-b border-slate-100 w-32">2. ポータル</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-center border-b border-slate-100 w-24">3. 品数</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 w-40 text-center">4. アクティビティ</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-center border-b border-slate-100 w-24">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBusinesses.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-10 text-center text-slate-300 font-bold">事業者が見つかりませんでした</td></tr>
              ) : filteredBusinesses.map(b => {
                const stats = getBusinessStats(b.id);
                return (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors group">
                    {/* 1. 事業者情報 (名前 + カテゴリ) */}
                    <td className="px-6 py-4 border-b border-slate-50/50">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 text-[14px] truncate">{b.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold mt-0.5">{b.category || '未設定'}</span>
                      </div>
                    </td>

                    {/* 2. 掲載ポータル (アイコン) */}
                    <td className="px-4 py-4 border-b border-slate-50/50">
                      <div className="flex justify-center gap-1">
                        {PORTALS.map(p => {
                          const isListed = b.portals?.includes(p.id);
                          return (
                            <div 
                              key={p.id} 
                              className={`w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-black transition-all ${
                                isListed ? `${p.color} text-white shadow-sm` : 'bg-slate-50 text-slate-100'
                              }`}
                              title={p.full}
                            >
                              {p.label}
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    {/* 3. 返礼品数 (総数 / 制作中) */}
                    <td className="px-4 py-4 text-center border-b border-slate-50/50">
                      <div className="flex flex-col items-center">
                        <span className="text-[15px] font-black text-slate-900">{stats.total}</span>
                        <span className={`text-[8px] font-black whitespace-nowrap mt-0.5 ${stats.inProduction > 5 ? 'text-rose-500' : 'text-slate-400'}`}>
                          制作中：{stats.inProduction}
                        </span>
                      </div>
                    </td>

                    {/* 4. アクティビティ */}
                    <td className="px-6 py-4 text-center border-b border-slate-50/50">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                          <Clock size={10} className="text-slate-300" />
                          {getLastActivity(b.id)}
                        </div>
                        <Link 
                          to={`${basePath}/products?businessId=${b.id}`}
                          className="text-[9px] font-black text-accent uppercase tracking-widest hover:underline flex items-center gap-0.5"
                        >
                          商品詳細 <ChevronRight size={10} />
                        </Link>
                      </div>
                    </td>

                    {/* 5. 操作 */}
                    <td className="px-4 py-4 text-center border-b border-slate-50/50">
                      <Link
                        to={`${basePath}/businesses/${b.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95 whitespace-nowrap"
                      >
                        <Edit size={12} />
                        編集
                      </Link>
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
