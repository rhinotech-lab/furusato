
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDb, MUNICIPALITIES, BUSINESSES, PRODUCT_GENRES, ADMIN_USERS } from '../services/mockDb';
import { ArrowLeft, Save, Tag, Thermometer, FolderCheck, Trash2 } from 'lucide-react';
import { TemperatureRange } from '../types';

export const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    business_id: '',
    system_admin_id: '',
    name: '',
    genre: '',
    description: '',
    product_code: '',
    internal_memo: '',
    temperature_range: '' as TemperatureRange | '',
    has_materials: false,
    deadline: '',
  });

  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'municipality_user') {
        setSelectedMunicipalityId(currentUser.municipality_id!.toString());
    }
  }, [currentUser]);

  useEffect(() => {
    if (isEdit && id) {
      const data = mockDb.getProductById(Number(id));
      if (data) {
        const business = mockDb.getBusinessById(data.business_id);
        
        if (currentUser?.role === 'municipality_user' && business?.municipality_id !== currentUser.municipality_id) {
            navigate('/municipality/products');
            return;
        }

        setFormData({ 
            business_id: data.business_id.toString(), 
            system_admin_id: data.system_admin_id?.toString() || '',
            name: data.name,
            genre: data.genre || '',
            description: data.description || '',
            product_code: data.product_code || '',
            internal_memo: data.internal_memo || '',
            temperature_range: data.temperature_range || '',
            has_materials: data.has_materials || false,
            deadline: data.deadline || '',
        });
        if (business) {
            setSelectedMunicipalityId(business.municipality_id.toString());
        }
      }
    }
  }, [id, isEdit, currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.business_id) return;

    const payload = {
        name: formData.name,
        business_id: Number(formData.business_id),
        system_admin_id: formData.system_admin_id ? Number(formData.system_admin_id) : undefined,
        genre: formData.genre || undefined,
        description: formData.description,
        product_code: formData.product_code || undefined,
        internal_memo: formData.internal_memo || undefined,
        temperature_range: (formData.temperature_range || undefined) as TemperatureRange | undefined,
        has_materials: formData.has_materials,
        deadline: formData.deadline || undefined
    };

    if (isEdit && id) {
      mockDb.updateProduct(Number(id), payload);
    } else {
      mockDb.addProduct(payload);
    }
    navigate(currentUser?.role === 'municipality_user' ? '/municipality/products' : '/admin/products');
  };

  const filteredBusinesses = BUSINESSES.filter(b => 
    !selectedMunicipalityId || b.municipality_id.toString() === selectedMunicipalityId
  );

  const handleDelete = () => {
    if (!id) return;
    if (window.confirm('この商品を削除してもよろしいですか？\n関連する画像データも削除されます。')) {
      mockDb.deleteProduct(Number(id));
      navigate(currentUser?.role === 'municipality_user' ? '/municipality/products' : '/admin/products');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white text-slate-400 hover:text-slate-900 rounded-xl shadow-sm border border-slate-100 transition-all active:scale-90">
          <ArrowLeft size={16} />
        </button>
        <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter">
                {isEdit ? '商品情報の編集' : '商品の新規登録'}
            </h1>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-premium border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentUser?.role !== 'municipality_user' && (
                <div className="md:col-span-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                        自治体 (絞り込み用)
                    </label>
                    <select
                        className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:bg-white outline-none font-bold text-slate-700 text-sm transition-all appearance-none cursor-pointer"
                        value={selectedMunicipalityId}
                        onChange={e => {
                            setSelectedMunicipalityId(e.target.value);
                            setFormData(prev => ({ ...prev, business_id: '' }));
                        }}
                    >
                        <option value="">全ての自治体</option>
                        {MUNICIPALITIES.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  事業者 <span className="text-red-500">*</span>
                </label>
                <select
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:bg-white outline-none font-bold text-slate-700 text-sm transition-all appearance-none cursor-pointer disabled:opacity-50"
                    value={formData.business_id}
                    onChange={e => setFormData({...formData, business_id: e.target.value})}
                    disabled={!selectedMunicipalityId && currentUser?.role !== 'municipality_user'}
                >
                    <option value="">事業者を選択</option>
                    {filteredBusinesses.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  システム管理者
                </label>
                <select
                    className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:bg-white outline-none font-bold text-slate-700 text-sm transition-all appearance-none cursor-pointer"
                    value={formData.system_admin_id}
                    onChange={e => setFormData({...formData, system_admin_id: e.target.value})}
                >
                    <option value="">システム管理者を選択</option>
                    {ADMIN_USERS.filter(u => u.role === 'super_admin' || u.role === 'creator').map(u => (
                        <option key={u.id} value={u.id.toString()}>{u.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  商品管理番号
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:bg-white outline-none font-bold text-slate-700 text-sm transition-all placeholder:text-slate-300 font-mono"
                  placeholder="例: P-12345"
                  value={formData.product_code}
                  onChange={e => setFormData({...formData, product_code: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  商品名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:bg-white outline-none font-bold text-slate-700 text-sm transition-all placeholder:text-slate-300"
                  placeholder="例: 特選牛セット"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  期限 <span className="text-slate-300 font-medium ml-1">(任意)</span>
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:bg-white outline-none font-bold text-slate-700 text-sm transition-all placeholder:text-slate-300 font-mono"
                  value={formData.deadline}
                  onChange={e => setFormData({...formData, deadline: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  内部メモ <span className="text-slate-300 font-medium ml-1">(任意)</span>
                </label>
                <textarea
                  className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:bg-white outline-none font-bold text-slate-700 text-sm transition-all placeholder:text-slate-300 min-h-[80px]"
                  placeholder="制作上の注意点や連絡事項など"
                  rows={3}
                  value={formData.internal_memo}
                  onChange={e => setFormData({...formData, internal_memo: e.target.value})}
                />
              </div>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-slate-50">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95"
              >
                <Trash2 size={14} />
                削除する
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-600 rounded-xl font-bold text-sm transition-all"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95 font-bold text-sm"
              >
                <Save size={14} />
                保存する
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
