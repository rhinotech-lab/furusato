
import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb, PRODUCTS, BUSINESSES } from '../services/mockDb';
import { AlertTriangle, ArrowRight, MessageCircle, Calendar, UserCheck, ChevronRight, Hash, Tag, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AlertList: React.FC = () => {
  const { currentUser, appSettings } = useAuth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const allImages = mockDb.getImages();

  const alertedProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
        const business = BUSINESSES.find(b => b.id === p.business_id);
        if (currentUser?.role === 'municipality_user' && business?.municipality_id !== currentUser.municipality_id) return false;

        if (!p.deadline) return false;
        const deadlineDate = new Date(p.deadline);
        // 期限超過、または未読コメントがある案件
        return deadlineDate < today || (p.unread_comments_count || 0) > 0;
    }).sort((a, b) => {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : 0;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : 0;
        return dateA - dateB;
    });
  }, [currentUser, today]);

  const basePath = currentUser?.role === 'municipality_user' ? '/municipality' : '/admin';
  const isMunicipality = currentUser?.role === 'municipality_user';

  const getProductThumbnail = (productId: number) => {
    const productImage = allImages.find(img => img.product_id === productId);
    return productImage?.versions[0]?.file_path || null;
  };

  const getDeadlineDays = (deadline?: string) => {
    if (!deadline) return 999;
    const target = new Date(deadline);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 3600 * 24));
  };

  const getDeadlineConfig = (deadline?: string) => {
    if (!deadline) return { style: 'text-slate-300', label: '-' };
    const diffDays = getDeadlineDays(deadline);

    if (diffDays < 0) {
      return { 
        style: 'bg-slate-900 text-white shadow-sm font-black', 
        label: '期限超過' 
      };
    }
    // グローバル設定に基づいて判定
    if (diffDays <= appSettings.warningDays) {
      return { 
        style: 'bg-rose-500 text-white shadow-sm font-black', 
        label: diffDays === 0 ? '本日締切' : `残り${diffDays}日` 
      };
    }
    if (diffDays <= appSettings.attentionDays) {
      return { 
        style: 'bg-amber-500 text-white shadow-sm font-bold', 
        label: `残り${diffDays}日` 
      };
    }
    return { 
      style: 'bg-slate-100 text-slate-500 font-bold', 
      label: `残り${diffDays}日` 
    };
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-700 h-full flex flex-col">
      <div className="flex justify-between items-end shrink-0">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
              <Link to={basePath} className="hover:text-slate-900 transition-colors">ホーム</Link>
              <ChevronRight size={10} className="mx-1 opacity-50" />
              <span>要対応案件</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
              <AlertTriangle className="text-rose-500" size={20} />
              要対応案件
          </h1>
        </div>

        {isMunicipality && alertedProducts.length > 0 && (
          <Link to={`${basePath}/images?status=pending_review`} className="bg-slate-900 text-white pl-3 pr-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl hover:bg-slate-800 transition-all group active:scale-95 border border-white/5">
            <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
              <UserCheck size={16} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black uppercase tracking-tight leading-none mb-0.5 text-slate-400">一括操作</span>
              <span className="text-[11px] font-black whitespace-nowrap">一括承認へ進む</span>
            </div>
            <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      <div className="bg-rose-50/50 border border-rose-100/50 rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-sm relative overflow-hidden backdrop-blur-sm">
        <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-rose-200 shrink-0">
            <AlertTriangle size={20} />
        </div>
        <div className="flex-1">
            <p className="text-rose-900 font-black text-sm">
              現在、<span className="text-lg mx-1">{alertedProducts.length}</span>件の案件でアクションが必要です
            </p>
            <p className="text-rose-700/60 text-[10px] font-bold leading-relaxed">
              返信または承認・差し戻しの判定を優先的に行ってください。
            </p>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-premium border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-auto scrollbar-hide flex-1">
          <table className="w-full text-left min-w-[900px] border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr className="bg-white/95 backdrop-blur-sm text-slate-400 shadow-sm">
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest w-28 border-b border-slate-100">対応理由</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest w-36 border-b border-slate-100">商品番号</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">商品名</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest w-32 text-center border-b border-slate-100">納期</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest w-16 text-center border-b border-slate-100">通知</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest w-16 border-b border-slate-100 text-center">詳細</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {alertedProducts.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-300 font-black">現在、対応が必要な案件はありません</td></tr>
              ) : alertedProducts.map(p => {
                const business = BUSINESSES.find(b => b.id === p.business_id);
                const deadlineInfo = getDeadlineConfig(p.deadline);
                const deadlineDays = getDeadlineDays(p.deadline);
                const thumb = getProductThumbnail(p.id);
                
                const hasUnread = p.unread_comments_count && p.unread_comments_count > 0;
                // 設定値に基づいて緊急度を判定
                const isUrgent = hasUnread && deadlineDays <= appSettings.warningDays;

                let reasonBadge = null;
                if (deadlineDays < 0) {
                    reasonBadge = <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[9px] font-black border border-rose-100">納期遅延</span>;
                } else if (hasUnread) {
                    reasonBadge = <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[9px] font-black border border-amber-100">新着コメ</span>;
                } else {
                    reasonBadge = <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black border border-blue-100">要確認</span>;
                }

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 border-b border-slate-50/50">
                        {reasonBadge}
                    </td>
                    <td className="px-6 py-4 border-b border-slate-50/50">
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] uppercase whitespace-nowrap">
                            <Hash size={12} className="text-slate-200" />
                            {p.product_code || '---'}
                        </div>
                    </td>
                    <td className="px-6 py-4 border-b border-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-6.5 bg-slate-100 rounded border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {thumb ? (
                                <img src={thumb} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <ImageIcon size={12} className="text-slate-300" />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest truncate max-w-[200px] mb-0.5">{business?.name}</span>
                                <span className="font-bold text-slate-900 text-[13px] truncate max-w-[300px]" title={p.name}>{p.name}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-4 py-4 text-center border-b border-slate-50/50">
                        <div className="inline-flex flex-col items-center gap-1 min-w-[90px]">
                            <div className={`px-2.5 py-0.5 rounded-md text-[9px] ${deadlineInfo.style} transition-all whitespace-nowrap uppercase`}>
                                {deadlineInfo.label}
                            </div>
                            <div className="text-[9px] text-slate-400 flex items-center gap-1 font-mono font-bold whitespace-nowrap opacity-60">
                                {p.deadline ? p.deadline.replace(/-/g, '/') : '-'}
                            </div>
                        </div>
                    </td>
                    <td className="px-4 py-4 text-center border-b border-slate-50/50">
                        {hasUnread ? (
                            <div 
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black shadow-lg transition-all whitespace-nowrap ${
                                isUrgent 
                                  ? 'bg-rose-600 text-white shadow-rose-200 animate-pulse' 
                                  : 'bg-amber-500 text-white shadow-amber-200'
                              }`}
                            >
                                <MessageCircle size={10} strokeWidth={3} />
                                {p.unread_comments_count}
                            </div>
                        ) : (
                            <span className="text-slate-100">-</span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap border-b border-slate-50/50">
                        <Link 
                          to={`${basePath}/images?productId=${p.id}`} 
                          className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-accent rounded-full hover:bg-accent hover:text-white transition-all group/btn shadow-sm"
                          title="詳細を表示"
                        >
                          <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
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
