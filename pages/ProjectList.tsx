
import React, { useState, useMemo } from 'react';
import { mockDb, MUNICIPALITIES, PROJECTS, PRODUCTS } from '../services/mockDb';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Plus, MapPin, Calendar, FolderKanban, ChevronRight, ArrowRight, Clock, Filter } from 'lucide-react';
import { ProjectStatus } from '../types';

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  not_started: { label: '未着手', className: 'bg-slate-100 text-slate-500 border-slate-200' },
  in_progress: { label: '着手', className: 'bg-blue-50 text-blue-600 border-blue-100' },
  completed: { label: '完了', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
};

export const ProjectList: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMunicipality, setFilterMunicipality] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | ''>('');

  const enrichedProjects = useMemo(() => {
    return PROJECTS.map(p => {
      const relatedProducts = PRODUCTS.filter(prod => prod.project_id === p.id);
      const municipality = MUNICIPALITIES.find(m => m.id === p.municipality_id);
      return { ...p, relatedProducts, municipality };
    });
  }, []);

  const filteredProjects = enrichedProjects.filter(p => {
    if (currentUser?.role === 'municipality_user' && p.municipality_id !== currentUser.municipality_id) return false;
    if (filterMunicipality && p.municipality_id.toString() !== filterMunicipality) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const basePath = currentUser?.role === 'municipality_user' ? '/municipality' : '/admin';

  const renderDateWithAlert = (date?: string, isCompleted?: boolean, isCollection?: boolean) => {
    if (!date) return <span className="text-slate-200">未設定</span>;
    
    const targetDate = new Date(date);
    const diffDays = Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    const formattedDate = date.replace(/-/g, '/');

    return (
      <div className="flex flex-col items-center">
        <span className="text-[11px] font-mono font-bold text-slate-500">{formattedDate}</span>
        {!isCompleted && diffDays <= 14 && (
          <span className={`text-[9px] font-black uppercase tracking-tighter mt-0.5 ${diffDays < 0 ? 'text-rose-600' : 'text-amber-500'}`}>
            <Clock size={10} className="inline mr-1" />
            {diffDays < 0 ? '期限過' : `${diffDays} Days Left`}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 h-full flex flex-col px-2">
      <div className="flex justify-between items-center shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
              <span>プロジェクト管理</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">プロジェクト一覧</h1>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl active:scale-95">
          <Plus size={18} /> 新規プロジェクト
        </button>
      </div>

      <div className="bg-white p-3 rounded-[1.5rem] shadow-premium border border-slate-100 flex flex-wrap gap-3 items-center shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="プロジェクト名で検索..." 
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

          <div className="relative w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
            <select 
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors appearance-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | '')}
            >
              <option value="">全てのステータス</option>
              <option value="not_started">未着手</option>
              <option value="in_progress">着手</option>
              <option value="completed">完了</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-auto scrollbar-hide flex-1">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-50/80 backdrop-blur-md text-slate-400">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">ステータス</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">プロジェクト名 / 自治体</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-center border-b border-slate-100">登録商品数</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-center border-b border-slate-100">作成日</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-center border-b border-slate-100">回収期限</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest w-12 border-b border-slate-100"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProjects.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-300 font-black">プロジェクトが見つかりませんでした</td></tr>
              ) : filteredProjects.map(p => {
                const config = statusConfig[p.status];
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest transition-all ${config.className}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-[14px] tracking-tight group-hover:text-accent transition-colors truncate max-w-[200px]">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{p.municipality?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-6 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-black text-slate-900">
                        {p.relatedProducts.length}
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Items</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        {p.created_at.replace(/-/g, '/')}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center bg-rose-50/20">
                      {renderDateWithAlert(p.collection_deadline, p.status === 'completed', true)}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <Link 
                        to={`${basePath}/products?projectId=${p.id}`} 
                        className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 text-accent rounded-xl hover:bg-accent hover:text-white transition-all shadow-sm"
                        title="商品一覧を表示"
                      >
                        <ArrowRight size={20} strokeWidth={3} />
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
