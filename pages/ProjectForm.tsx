import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDb, MUNICIPALITIES } from '../services/mockDb';
import { ProjectStatus } from '../types';
import { ArrowLeft, Save } from 'lucide-react';

export const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    municipality_id: '',
    name: '',
    status: 'in_progress' as ProjectStatus,
    deadline: '',
    description: '',
  });

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'municipality_user' || currentUser.role === 'business_user') {
      setFormData((prev) => ({
        ...prev,
        municipality_id: currentUser.municipality_id?.toString() || '',
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (!isEdit || !id || !currentUser) return;
    const project = mockDb.getProjectById(Number(id));
    if (!project) return;

    if (
      (currentUser.role === 'municipality_user' || currentUser.role === 'business_user') &&
      currentUser.municipality_id !== project.municipality_id
    ) {
      const basePath = currentUser.role === 'municipality_user' ? '/municipality' : currentUser.role === 'business_user' ? '/business' : '/admin';
      navigate(`${basePath}/images`);
      return;
    }

    setFormData({
      municipality_id: project.municipality_id.toString(),
      name: project.name,
      status: project.status,
      deadline: project.deadline || '',
      description: project.description || '',
    });
  }, [isEdit, id, currentUser, navigate]);

  const basePath = currentUser?.role === 'municipality_user' ? '/municipality' : currentUser?.role === 'business_user' ? '/business' : '/admin';
  const canSelectMunicipality = currentUser?.role === 'super_admin' || currentUser?.role === 'creator';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.municipality_id) return;

    mockDb.updateProject(Number(id), {
      name: formData.name,
      municipality_id: Number(formData.municipality_id),
      status: formData.status,
      deadline: formData.deadline || undefined,
      description: formData.description || undefined,
    });

    navigate(`${basePath}/images`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(`${basePath}/images`)}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">プロジェクト情報の編集</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[1.5rem] shadow-premium border border-slate-100 overflow-hidden">
        <div className="p-8 grid grid-cols-1 gap-6">
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
              自治体 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.municipality_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, municipality_id: e.target.value }))}
              required
              disabled={!canSelectMunicipality}
              className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all disabled:opacity-70"
            >
              <option value="">選択してください</option>
              {MUNICIPALITIES.map((m) => (
                <option key={m.id} value={m.id.toString()}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
              プロジェクト名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">ステータス</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as ProjectStatus }))}
                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all"
              >
                <option value="not_started">未開始</option>
                <option value="in_progress">進行中</option>
                <option value="completed">完了</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">期限（任意）</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">説明（任意）</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={5}
              className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all resize-y"
              placeholder="プロジェクトの説明を入力"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/images`)}
            className="px-8 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black text-[13px] hover:bg-slate-200 transition-all"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[13px] hover:bg-slate-800 transition-all shadow-lg"
          >
            <Save size={14} />
            保存する
          </button>
        </div>
      </form>
    </div>
  );
};
