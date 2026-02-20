import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockDb } from '../services/mockDb';
import { ArrowLeft, Save } from 'lucide-react';

export const MunicipalityForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });

  useEffect(() => {
    if (isEdit && id) {
      const data = mockDb.getMunicipalityById(Number(id));
      if (data) {
        setFormData({ name: data.name, code: data.code });
      }
    }
  }, [id, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    if (isEdit && id) {
      mockDb.updateMunicipality(Number(id), formData);
    } else {
      mockDb.addMunicipality(formData);
    }
    navigate('/admin/municipalities');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white text-slate-400 hover:text-slate-900 rounded-xl shadow-sm border border-slate-100 transition-all active:scale-90">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tighter">
          {isEdit ? '自治体情報の編集' : '自治体の新規登録'}
        </h1>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-premium border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">
              自治体コード <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all"
              placeholder="例: 011002"
              value={formData.code}
              onChange={e => setFormData({...formData, code: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">
              自治体名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all"
              placeholder="例: 北海道札幌市"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-50">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 text-slate-400 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-sm transition-all"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 font-bold text-sm"
            >
              <Save size={14} />
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};