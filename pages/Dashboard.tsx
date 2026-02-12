
import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../services/mockDb';
import { Clock, CheckCircle, FileImage, AlertTriangle, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { ImageStatus } from '../types';

const STATUS_PRIORITY: Record<ImageStatus, number> = {
  rejected: 0,
  pending_review: 1,
  revising: 2,
  draft: 3,
  approved: 4,
};

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const images = mockDb.getImages();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const relevantImages = images.filter(img => {
    const product = mockDb.getProductById(img.product_id);
    if (currentUser?.role === 'municipality_user') {
        const business = product ? mockDb.getBusinessById(product.business_id) : null;
        return business?.municipality_id === currentUser.municipality_id;
    }
    if (currentUser?.role === 'business_user') {
        return product?.business_id === currentUser.business_id;
    }
    return true;
  }).sort((a, b) => {
    const statusA = a.versions[a.versions.length - 1].status;
    const statusB = b.versions[b.versions.length - 1].status;
    const priA = STATUS_PRIORITY[statusA];
    const priB = STATUS_PRIORITY[statusB];
    if (priA !== priB) return priA - priB;
    return new Date(b.versions[b.versions.length - 1].created_at).getTime() - new Date(a.versions[a.versions.length - 1].created_at).getTime();
  });

  const getLatestVersion = (img: any) => img.versions[img.versions.length - 1];
  const pendingCount = relevantImages.filter(img => getLatestVersion(img)?.status === 'pending_review').length;
  const approvedCount = relevantImages.filter(img => getLatestVersion(img)?.status === 'approved').length;
  
  const alertCount = mockDb.getProducts().filter(p => {
    if (currentUser?.role === 'municipality_user') {
      const business = mockDb.getBusinessById(p.business_id);
      if (business?.municipality_id !== currentUser.municipality_id) return false;
    }
    if (currentUser?.role === 'business_user') {
      if (p.business_id !== currentUser.business_id) return false;
    }
    
    if (!p.deadline) return false;
    const deadlineDate = new Date(p.deadline);
    return deadlineDate < today || (p.unread_comments_count || 0) > 0;
  }).length;

  const basePath = currentUser?.role === 'municipality_user' ? '/municipality' : currentUser?.role === 'business_user' ? '/business' : '/admin';

  const stats = [
    { label: '要対応', value: alertCount, icon: AlertTriangle, color: 'rose', path: `${basePath}/alerts` },
    { label: '承認待ち', value: pendingCount, icon: Clock, color: 'blue', path: `${basePath}/images?status=pending_review` },
    { label: '承認済み', value: approvedCount, icon: CheckCircle, color: 'emerald', path: `${basePath}/images?status=approved` },
    { label: '全案件数', value: relevantImages.length, icon: FileImage, color: 'slate', path: `${basePath}/images` },
  ];

  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-500 ring-blue-100',
    rose: 'bg-rose-50 text-rose-500 ring-rose-100',
    emerald: 'bg-emerald-50 text-emerald-500 ring-emerald-100',
    slate: 'bg-slate-50 text-slate-500 ring-slate-100',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 h-full flex flex-col pb-12 px-8 lg:px-12 pt-8">
      <div className="flex flex-col shrink-0 space-y-1">
        <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <span>ホーム</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">ダッシュボード</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 shrink-0">
        {stats.map((stat, i) => (
            <Link key={i} to={stat.path} className="bg-white p-8 rounded-[2rem] shadow-premium border border-slate-100 hover:scale-[1.02] hover:shadow-xl transition-all group block">
                <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-full ring-1 ${colorMap[stat.color]} shrink-0 transition-transform group-hover:scale-110 flex items-center justify-center`}>
                        <stat.icon size={26} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2 truncate">{stat.label}</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{stat.value}</p>
                    </div>
                </div>
            </Link>
        ))}
      </div>

      <div className="flex flex-col bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden min-h-0 flex-1">
        <div className="px-10 py-7 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">最新の更新状況</h2>
            <Link to={`${basePath}/images`} className="text-[11px] font-black text-accent uppercase tracking-widest hover:underline flex items-center gap-1">履歴をすべて表示 <ChevronRight size={14} /></Link>
        </div>
        <div className="overflow-auto scrollbar-hide flex-1">
            <table className="w-full text-left border-separate border-spacing-0">
                <thead className="sticky top-0 z-10">
                    <tr className="bg-white/95 backdrop-blur-sm text-slate-400">
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest w-48 border-b border-slate-100">ステータス</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">内容 / 制作種別</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest w-16 border-b border-slate-100"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {relevantImages.length === 0 ? (
                        <tr><td colSpan={3} className="px-10 py-24 text-center text-slate-300 font-bold">更新履歴はありません</td></tr>
                    ) : relevantImages.slice(0, 25).map(img => {
                        const latestVer = getLatestVersion(img);
                        const productName = mockDb.getProductById(img.product_id)?.name;
                        return (
                            <tr key={img.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-10 py-6 whitespace-nowrap border-b border-slate-50/50"><StatusBadge status={latestVer.status} /></td>
                                <td className="px-10 py-6 border-b border-slate-50/50">
                                  <div className="flex items-center gap-6">
                                    <div className="w-16 h-10 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center shadow-sm">
                                        {latestVer.file_path ? <img src={latestVer.file_path} className="w-full h-full object-cover" alt="" /> : <ImageIcon size={16} className="text-slate-300" />}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-slate-900 text-base truncate mb-1">{img.title}</span>
                                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tight truncate">{productName}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-10 py-6 text-right whitespace-nowrap border-b border-slate-50/50">
                                    <Link to={`${basePath}/revisions/${img.id}`} className="p-2 inline-block text-slate-200 hover:text-accent transition-colors"><ChevronRight size={24} /></Link>
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
