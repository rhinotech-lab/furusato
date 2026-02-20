
import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../services/mockDb';
import { Clock, CheckCircle, FileImage, AlertTriangle, ChevronRight, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';
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
    { label: '全プロジェクト数', value: relevantImages.length, icon: FileImage, color: 'slate', path: `${basePath}/images` },
  ];

  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-500 ring-blue-100',
    rose: 'bg-rose-50 text-rose-500 ring-rose-100',
    emerald: 'bg-emerald-50 text-emerald-500 ring-emerald-100',
    slate: 'bg-slate-50 text-slate-500 ring-slate-100',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 h-full flex flex-col">
      <div className="flex flex-col shrink-0">
        <h1 className="text-xl font-black text-slate-900 tracking-tighter">ホーム</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        {stats.map((stat, i) => (
            <Link key={i} to={stat.path} className="bg-white px-4 py-3.5 rounded-xl shadow-premium border border-slate-100 hover:scale-[1.02] hover:shadow-xl transition-all group block">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ring-1 ${colorMap[stat.color]} shrink-0 transition-transform group-hover:scale-110 flex items-center justify-center`}>
                        <stat.icon size={16} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5 truncate">{stat.label}</p>
                        <p className="text-[15px] font-black text-slate-900 tracking-tighter leading-none">{stat.value}</p>
                    </div>
                </div>
            </Link>
        ))}
      </div>

      <div className="flex flex-col bg-white rounded-[1.5rem] shadow-premium border border-slate-100 overflow-hidden min-h-0 flex-1">
        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
            <h2 className="text-[14px] font-black text-slate-900 tracking-tight">最新の更新状況</h2>
            <Link to={`${basePath}/images`} className="text-[9px] font-black text-accent uppercase tracking-widest hover:underline flex items-center gap-0.5">履歴をすべて表示 <ChevronRight size={10} /></Link>
        </div>
        <div className="overflow-auto scrollbar-hide flex-1">
            <table className="w-full text-left border-separate border-spacing-0">
                <thead className="sticky top-0 z-10">
                    <tr className="bg-white/95 backdrop-blur-sm text-slate-400 shadow-sm">
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">ステータス</th>
                        <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">プロジェクト / 商品</th>
                        <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">事業者</th>
                        <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 text-center">期限</th>
                        <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 text-center">更新日</th>
                        <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 text-center">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {relevantImages.length === 0 ? (
                        <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-300 font-bold">更新履歴はありません</td></tr>
                    ) : relevantImages.slice(0, 25).map(img => {
                        const latestVer = getLatestVersion(img);
                        const product = mockDb.getProductById(img.product_id);
                        const business = product ? mockDb.getBusinessById(product.business_id) : null;
                        const updateDate = new Date(latestVer.created_at);
                        const deadlineDiff = product?.deadline ? Math.ceil((new Date(product.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                        return (
                            <tr key={img.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-4 py-3 whitespace-nowrap border-b border-slate-50/50"><StatusBadge status={latestVer.status} /></td>
                                <td className="px-3 py-3 border-b border-slate-50/50">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-7 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center shadow-sm">
                                        {latestVer.file_path ? <img src={latestVer.file_path} className="w-full h-full object-cover" alt="" /> : <ImageIcon size={14} className="text-slate-300" />}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-slate-900 text-[13px] truncate">{img.title}</span>
                                        <span className="text-[10px] text-slate-400 font-bold truncate">{product?.name}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-3 border-b border-slate-50/50">
                                  <span className="text-[11px] font-bold text-slate-500 truncate block">{business?.name || '---'}</span>
                                </td>
                                <td className="px-3 py-3 text-center border-b border-slate-50/50 whitespace-nowrap">
                                  {product?.deadline ? (
                                    <span className={`text-[10px] font-mono font-black ${deadlineDiff !== null && deadlineDiff < 0 ? 'text-red-500' : (deadlineDiff !== null && deadlineDiff <= 7 ? 'text-amber-500' : 'text-slate-400')}`}>
                                      {new Date(product.deadline).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })}
                                      {deadlineDiff !== null && deadlineDiff < 0 && <span className="ml-0.5 text-[9px]">({Math.abs(deadlineDiff)}日超過)</span>}
                                      {deadlineDiff !== null && deadlineDiff >= 0 && deadlineDiff <= 7 && <span className="ml-0.5 text-[9px]">(残{deadlineDiff}日)</span>}
                                    </span>
                                  ) : <span className="text-[10px] text-slate-300">---</span>}
                                </td>
                                <td className="px-3 py-3 text-center border-b border-slate-50/50 whitespace-nowrap">
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {updateDate.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })} {updateDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </td>
                                <td className="px-3 py-3 text-center whitespace-nowrap border-b border-slate-50/50">
                                    <Link to={`${basePath}/revisions/${img.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all active:scale-95">
                                        詳細 <ChevronRight size={10} />
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
