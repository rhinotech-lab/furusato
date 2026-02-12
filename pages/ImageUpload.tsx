
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDb, MUNICIPALITIES, BUSINESSES, PRODUCTS } from '../services/mockDb';
import { ArrowLeft, UploadCloud, FileImage, X, Brain, Sparkles, AlertTriangle, ThumbsUp, Link as LinkIcon } from 'lucide-react';

export const ImageUpload: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Select Product, 2: Upload File
  
  // Selection State
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string>('');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  // File State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize for municipality user
  useEffect(() => {
    if (currentUser?.role === 'municipality_user') {
        setSelectedMunicipalityId(currentUser.municipality_id!.toString());
    }
  }, [currentUser]);

  // Derived lists
  const filteredBusinesses = BUSINESSES.filter(b => 
    !selectedMunicipalityId || b.municipality_id.toString() === selectedMunicipalityId
  );
  const filteredProducts = PRODUCTS.filter(p => 
    !selectedBusinessId || p.business_id.toString() === selectedBusinessId
  );

  // AIインサイトの取得 (モック)
  const municipalityInsight = selectedMunicipalityId === '1' ? {
    tip: "寒色系（青・紫）を避けると承認率がアップします。",
    risk: "金額フォントサイズ不足による差し戻しに注意。"
  } : selectedMunicipalityId === '3' ? {
    tip: "モダンでフラットなデザインを好まれます。",
    risk: "市章の配置ミスは致命的な差し戻しになります。"
  } : null;

  // Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
    }
  };
  const processFile = (f: File) => {
    if (!f.type.startsWith('image/')) {
        alert('画像ファイルを選択してください');
        return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !title || !previewUrl) return;

    mockDb.addImage({
        product_id: Number(selectedProductId),
        title: title,
        external_url: externalUrl,
        created_by_admin_id: currentUser!.id,
        file_path: previewUrl
    });

    const basePath = currentUser?.role === 'municipality_user' ? '/municipality' : '/admin';
    navigate(`${basePath}/images`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white text-slate-400 hover:text-slate-900 rounded-2xl shadow-sm border border-slate-100 transition-all active:scale-90">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">新規画像登録</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
            <div className="flex border-b border-slate-50">
                <div className={`flex-1 p-5 text-center font-black text-xs uppercase tracking-widest ${step === 1 ? 'text-accent bg-blue-50/50' : 'text-slate-300'}`}>
                    1. 商品選択
                </div>
                <div className={`flex-1 p-5 text-center font-black text-xs uppercase tracking-widest ${step === 2 ? 'text-accent bg-blue-50/50' : 'text-slate-300'}`}>
                    2. 画像アップロード
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 lg:p-10">
                {step === 1 && (
                    <div className="space-y-6 max-w-lg mx-auto">
                        {currentUser?.role !== 'municipality_user' && (
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">自治体</label>
                                <select
                                    className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-accent/5 transition-all appearance-none cursor-pointer"
                                    value={selectedMunicipalityId}
                                    onChange={e => {
                                        setSelectedMunicipalityId(e.target.value);
                                        setSelectedBusinessId('');
                                        setSelectedProductId('');
                                    }}
                                >
                                    <option value="">選択してください</option>
                                    {MUNICIPALITIES.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">事業者</label>
                            <select
                                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-accent/5 transition-all appearance-none cursor-pointer disabled:opacity-50"
                                value={selectedBusinessId}
                                disabled={!selectedMunicipalityId}
                                onChange={e => {
                                    setSelectedBusinessId(e.target.value);
                                    setSelectedProductId('');
                                }}
                            >
                                <option value="">選択してください</option>
                                {filteredBusinesses.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">商品</label>
                            <select
                                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-accent/5 transition-all appearance-none cursor-pointer disabled:opacity-50"
                                value={selectedProductId}
                                disabled={!selectedBusinessId}
                                onChange={e => setSelectedProductId(e.target.value)}
                            >
                                <option value="">選択してください</option>
                                {filteredProducts.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="button"
                                disabled={!selectedProductId}
                                onClick={() => setStep(2)}
                                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-xl active:scale-95"
                            >
                                次へ進む
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">画像タイトル</label>
                            <input
                                type="text"
                                required
                                placeholder="例: メインバナー、正方形サムネイルなど"
                                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-accent/5 transition-all"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                <LinkIcon size={12} /> 外部リンクURL <span className="text-[9px] font-medium opacity-40 ml-1">(任意)</span>
                            </label>
                            <input
                                type="url"
                                placeholder="https://item.rakuten.co.jp/..."
                                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-accent/5 transition-all"
                                value={externalUrl}
                                onChange={e => setExternalUrl(e.target.value)}
                            />
                        </div>

                        <div 
                            className={`border-2 border-dashed rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-slate-50/50 ${
                                isDragging ? 'border-accent bg-blue-50/50' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => !file && document.getElementById('file-upload')?.click()}
                        >
                            {!file ? (
                                <>
                                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-6 text-slate-300 shadow-sm border border-slate-100">
                                        <UploadCloud size={36} />
                                    </div>
                                    <p className="font-black text-slate-900 text-base">クリックしてアップロード</p>
                                    <p className="text-sm text-slate-400 font-bold mt-2">またはドラッグ＆ドロップ</p>
                                    <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-6">PNG, JPG up to 10MB</p>
                                    <input 
                                        id="file-upload" 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                </>
                            ) : (
                                <div className="relative group w-full max-w-md animate-in zoom-in duration-300">
                                    <img src={previewUrl!} alt="Preview" className="w-full h-auto rounded-3xl shadow-2xl max-h-[400px] object-contain bg-checkered ring-8 ring-white" />
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }}
                                        className="absolute -top-4 -right-4 p-3 bg-rose-500 text-white rounded-2xl shadow-xl hover:bg-rose-600 transition-all border-4 border-white active:scale-90"
                                    >
                                        <X size={20} strokeWidth={3} />
                                    </button>
                                    <div className="mt-6 flex items-center justify-center gap-3 text-xs font-black text-slate-400">
                                        <FileImage size={18} />
                                        <span>{file.name}</span>
                                        <span className="text-slate-200">/</span>
                                        <span>{(file.size / 1024).toFixed(0)} KB</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex justify-between items-center">
                             <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-6 py-2 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors"
                            >
                                戻る
                            </button>
                            <button
                                type="submit"
                                disabled={!file || !title}
                                className="px-10 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-xl active:scale-95 font-black text-sm"
                            >
                                画像を登録する
                            </button>
                        </div>
                    </div>
                )}
            </form>
          </div>
        </div>

        {/* AI Insight Widget */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-indigo-600/40"></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-400">
                  <Brain size={24} />
                </div>
                <div>
                  <h3 className="font-black text-base tracking-tight leading-none mb-1">AI 提出前チェック</h3>
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Powered by Insight AI</p>
                </div>
              </div>

              {!municipalityInsight ? (
                <div className="py-10 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-white/5 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                  <p className="text-[11px] font-bold text-white/30">自治体を選択してください...</p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <ThumbsUp size={14} className="text-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Success Tip</span>
                    </div>
                    <p className="text-xs font-bold leading-relaxed">{municipalityInsight.tip}</p>
                  </div>
                  <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} className="text-rose-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Rejection Risk</span>
                    </div>
                    <p className="text-xs font-bold leading-relaxed text-rose-100">{municipalityInsight.risk}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles size={14} /> 制作ガイドライン
            </h3>
            <div className="space-y-4">
              {[
                { label: '配色', text: '自治体指定のアクセントカラーを30%以上使用' },
                { label: '文字', text: '寄付金額は白枠+黒影で視認性を確保' },
                { label: '権利', text: '人物・景観写真の権利元を必ず明記' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-[10px] font-black text-slate-300 uppercase shrink-0 pt-0.5">{item.label}</span>
                  <p className="text-[11px] font-bold text-slate-600 leading-snug">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
