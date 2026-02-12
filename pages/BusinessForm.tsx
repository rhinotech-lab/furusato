
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDb, MUNICIPALITIES, PRODUCT_GENRES, PORTALS } from '../services/mockDb';
import { ArrowLeft, Save, User, Phone, Tag, Mail, CheckCircle2 } from 'lucide-react';

export const BusinessForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    municipality_id: currentUser?.role === 'municipality_user' ? currentUser.municipality_id?.toString() : '',
    name: '',
    code: '',
    category: '',
    portals: [] as string[],
    management_id: '',
    contact_person: '',
    contact_tel: '',
    contact_email: '',
    notes: ''
  });

  useEffect(() => {
    if (isEdit && id) {
      const data = mockDb.getBusinessById(Number(id));
      if (data) {
        if (currentUser?.role === 'municipality_user' && data.municipality_id !== currentUser.municipality_id) {
           navigate('/municipality/businesses');
           return;
        }
        setFormData({ 
            municipality_id: data.municipality_id.toString(), 
            name: data.name,
            code: data.code,
            category: data.category || '',
            portals: data.portals || [],
            management_id: data.management_id || '',
            contact_person: data.contact_person || '',
            contact_tel: data.contact_tel || '',
            contact_email: data.contact_email || '',
            notes: data.notes || ''
        });
      }
    }
  }, [id, isEdit, currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.municipality_id || !formData.code) return;

    const payload = {
        name: formData.name,
        code: formData.code,
        municipality_id: Number(formData.municipality_id),
        category: formData.category || undefined,
        portals: formData.portals,
        management_id: formData.management_id || undefined,
        contact_person: formData.contact_person || undefined,
        contact_tel: formData.contact_tel || undefined,
        contact_email: formData.contact_email || undefined,
        notes: formData.notes || undefined
    };

    if (isEdit && id) {
      mockDb.updateBusiness(Number(id), payload);
    } else {
      mockDb.addBusiness(payload);
    }
    navigate(currentUser?.role === 'municipality_user' ? '/municipality/businesses' : '/admin/businesses');
  };

  const togglePortal = (portalId: string) => {
    setFormData(prev => ({
        ...prev,
        portals: prev.portals.includes(portalId) 
            ? prev.portals.filter(p => p !== portalId) 
            : [...prev.portals, portalId]
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white text-slate-400 hover:text-slate-900 rounded-2xl shadow-sm border border-slate-100 transition-all active:scale-90">
          <ArrowLeft size={20} />
        </button>
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              {isEdit ? '事業者の編集' : '事業者の新規登録'}
            </h1>
            <p className="text-sm text-slate-400 font-medium">基本情報と掲載ポータル情報を入力してください。</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">基本情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentUser?.role !== 'municipality_user' && (
                    <div className="md:col-span-2">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">所属自治体 *</label>
                        <select
                            required
                            className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-accent/5 transition-all cursor-pointer appearance-none"
                            value={formData.municipality_id}
                            onChange={e => setFormData({...formData, municipality_id: e.target.value})}
                        >
                            <option value="">自治体を選択</option>
                            {MUNICIPALITIES.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">事業者名 *</label>
                    <input
                      type="text" required
                      className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-accent/5 transition-all"
                      placeholder="例: 株式会社〇〇"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">事業者コード *</label>
                    <input
                      type="text" required
                      className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-accent/5 transition-all"
                      placeholder="例: B-0001"
                      value={formData.code}
                      onChange={e => setFormData({...formData, code: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">主要カテゴリ</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                      <select
                          className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-accent/5 transition-all appearance-none cursor-pointer"
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                          <option value="">カテゴリを選択</option>
                          {PRODUCT_GENRES.map(g => (
                              <option key={g} value={g}>{g}</option>
                          ))}
                      </select>
                    </div>
                  </div>
              </div>
          </div>

          <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">掲載ポータル設定</h3>
              <p className="text-[10px] text-slate-400 font-bold -mt-2">アイコンをクリックして掲載先をオン・オフしてください。</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {PORTALS.map(p => {
                      const isActive = formData.portals.includes(p.id);
                      return (
                          <button
                              key={p.id}
                              type="button"
                              onClick={() => togglePortal(p.id)}
                              className={`relative flex flex-col items-center gap-4 p-8 rounded-[3rem] border-2 transition-all duration-300 group overflow-hidden ${
                                  isActive 
                                      ? 'border-accent bg-blue-50/50 shadow-xl shadow-accent/10 ring-4 ring-accent/5' 
                                      : 'border-slate-50 bg-slate-50/50 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:border-slate-200'
                              }`}
                          >
                              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xs font-black shadow-lg transition-transform group-hover:scale-110 ${isActive ? p.color + ' text-white' : 'bg-white text-slate-300'}`}>
                                  {p.label}
                              </div>
                              <span className={`text-[12px] font-black tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>{p.full}</span>
                              
                              {isActive && (
                                  <div className="absolute top-4 right-4 text-accent animate-in zoom-in duration-300">
                                      <CheckCircle2 size={20} />
                                  </div>
                              )}
                          </button>
                      );
                  })}
              </div>
          </div>

          <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">連絡先情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">担当者名</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type="text"
                        className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-accent/5 transition-all"
                        placeholder="例: 佐藤 太郎"
                        value={formData.contact_person}
                        onChange={e => setFormData({...formData, contact_person: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">電話番号</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type="tel"
                        className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-accent/5 transition-all"
                        placeholder="例: 090-0000-0000"
                        value={formData.contact_tel}
                        onChange={e => setFormData({...formData, contact_tel: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">メールアドレス</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type="email"
                        className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-accent/5 transition-all"
                        placeholder="例: taro.sato@example.com"
                        value={formData.contact_email}
                        onChange={e => setFormData({...formData, contact_email: e.target.value})}
                      />
                    </div>
                  </div>
              </div>
          </div>

          <div className="pt-8 flex justify-end gap-3 border-t border-slate-50">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-3.5 text-slate-400 bg-slate-50 hover:bg-slate-100 rounded-2xl font-bold transition-all"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-10 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 font-bold"
            >
              <Save size={18} />
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
