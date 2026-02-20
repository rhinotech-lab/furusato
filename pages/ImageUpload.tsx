
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDb, MUNICIPALITIES, BUSINESSES, PRODUCTS } from '../services/mockDb';
import { ArrowLeft, UploadCloud, FileImage, X, Link as LinkIcon } from 'lucide-react';

export const ImageUpload: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Select/Create Product, 2: Upload Image
  
  // Project State
  const [projectName, setProjectName] = useState('');
  const [projectDeadline, setProjectDeadline] = useState('');
  
  // Selection State
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string>('');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isNewProduct, setIsNewProduct] = useState(false);

  // New Product State
  const [newProductName, setNewProductName] = useState('');
  const [newProductCode, setNewProductCode] = useState('');
  const [newProductDeadline, setNewProductDeadline] = useState('');

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
    if (!projectName || !selectedMunicipalityId) return;
    
    let targetProductId = Number(selectedProductId);

    // プロジェクトを作成
    const newProject = mockDb.addProject({
        name: projectName,
        municipality_id: Number(selectedMunicipalityId),
        status: 'in_progress',
        deadline: projectDeadline || undefined
    });
    const createdProjectId = newProject.id;

    // 新規商品作成の場合
    if (isNewProduct) {
        if (!newProductName || !selectedBusinessId) return;
        
        const newProduct = mockDb.addProduct({
            name: newProductName,
            business_id: Number(selectedBusinessId),
            project_id: createdProjectId,
            product_code: newProductCode || undefined,
            deadline: newProductDeadline || undefined,
            donation_amount: 0, // デフォルト値
            portals: [] // デフォルト値
        });
        targetProductId = newProduct.id;
    } else {
        if (!selectedProductId) return;
        // 既存商品にプロジェクトIDを紐付け
        mockDb.updateProduct(targetProductId, { project_id: createdProjectId });
    }

    // 画像がある場合のみ画像エンティティを作成
    if (previewUrl && title) {
        mockDb.addImage({
            product_id: targetProductId,
            title: title,
            external_url: externalUrl,
            created_by_admin_id: currentUser!.id,
            file_path: previewUrl
        });
    }

    const basePath = currentUser?.role === 'municipality_user' ? '/municipality' : '/admin';
    navigate(`${basePath}/images`);
  };

  // プロジェクトのみ登録（商品・画像なし）
  const handleProjectOnlySubmit = () => {
    if (!projectName || !selectedMunicipalityId) return;
    
    // プロジェクトを作成
    mockDb.addProject({
        name: projectName,
        municipality_id: Number(selectedMunicipalityId),
        status: 'in_progress',
        deadline: projectDeadline || undefined
    });

    const basePath = currentUser?.role === 'municipality_user' ? '/municipality' : '/admin';
    navigate(`${basePath}/images`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white text-slate-400 hover:text-slate-900 rounded-xl shadow-sm border border-slate-100 transition-all active:scale-90">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tighter">新規プロジェクト登録</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <div className="bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden">
            <div className="flex border-b border-slate-50">
                <div className={`flex-1 p-3 text-center font-bold text-[10px] uppercase tracking-widest ${step === 1 ? 'text-accent bg-blue-50/50' : 'text-slate-300'}`}>
                    1. 商品選択 / 作成
                </div>
                <div className={`flex-1 p-3 text-center font-bold text-[10px] uppercase tracking-widest ${step === 2 ? 'text-accent bg-blue-50/50' : 'text-slate-300'}`}>
                    2. 画像アップロード
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                {step === 1 && (
                    <div className="space-y-6 max-w-lg mx-auto">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">プロジェクト名 <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all placeholder:text-slate-300"
                                placeholder="例: 冬の特産品キャンペーン2025"
                                value={projectName}
                                onChange={e => setProjectName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">プロジェクト期限 <span className="text-[9px] font-medium opacity-50 ml-1">(任意)</span></label>
                            <input
                                type="date"
                                className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all placeholder:text-slate-300 font-mono"
                                value={projectDeadline}
                                onChange={e => setProjectDeadline(e.target.value)}
                            />
                        </div>

                        {currentUser?.role !== 'municipality_user' && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">自治体</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all appearance-none cursor-pointer"
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
                        
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">事業者</label>
                            <select
                                className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50"
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

                        <div className="space-y-3 pt-2">
                            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsNewProduct(false)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!isNewProduct ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    既存の商品から選択
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsNewProduct(true)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${isNewProduct ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    新規商品を登録
                                </button>
                            </div>

                            {!isNewProduct ? (
                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">商品</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50"
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
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">商品名 <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 text-sm focus:border-accent transition-all placeholder:text-slate-300"
                                            placeholder="例: 特選牛セット"
                                            value={newProductName}
                                            onChange={e => setNewProductName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">商品管理番号 <span className="text-[9px] font-medium opacity-50 ml-1">(任意)</span></label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 text-sm focus:border-accent transition-all placeholder:text-slate-300 font-mono"
                                            placeholder="例: P-12345"
                                            value={newProductCode}
                                            onChange={e => setNewProductCode(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">期限 <span className="text-[9px] font-medium opacity-50 ml-1">(任意)</span></label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 text-sm focus:border-accent transition-all placeholder:text-slate-300 font-mono"
                                            value={newProductDeadline}
                                            onChange={e => setNewProductDeadline(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex justify-between items-center">
                            <button
                                type="button"
                                disabled={!projectName || !selectedMunicipalityId}
                                onClick={handleProjectOnlySubmit}
                                className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-[11px] hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 transition-all shadow-sm active:scale-95"
                            >
                                プロジェクトのみ登録する
                            </button>
                            <button
                                type="button"
                                disabled={!projectName || !selectedMunicipalityId || !selectedBusinessId || (!isNewProduct && !selectedProductId) || (isNewProduct && !newProductName)}
                                onClick={() => setStep(2)}
                                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[11px] hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-lg active:scale-95 ml-auto"
                            >
                                次へ進む（画像登録）
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                画像タイトル <span className="text-[9px] font-medium opacity-40 ml-1">(任意)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="例: メインバナー、正方形サムネイルなど"
                                className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                                <LinkIcon size={10} /> 外部リンクURL <span className="text-[9px] font-medium opacity-40 ml-1">(任意)</span>
                            </label>
                            <input
                                type="url"
                                placeholder="https://item.rakuten.co.jp/..."
                                className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all"
                                value={externalUrl}
                                onChange={e => setExternalUrl(e.target.value)}
                            />
                        </div>

                        <div 
                            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-slate-50/50 ${
                                isDragging ? 'border-accent bg-blue-50/50' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => !file && document.getElementById('file-upload')?.click()}
                        >
                            {!file ? (
                                <>
                                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 text-slate-300 shadow-sm border border-slate-100">
                                        <UploadCloud size={24} />
                                    </div>
                                    <p className="font-bold text-slate-900 text-sm">クリックしてアップロード</p>
                                    <p className="text-[11px] text-slate-400 font-bold mt-1">またはドラッグ＆ドロップ</p>
                                    <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-4">PNG, JPG up to 10MB <span className="text-slate-200">(任意)</span></p>
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
                                    <img src={previewUrl!} alt="Preview" className="w-full h-auto rounded-xl shadow-xl max-h-[300px] object-contain bg-checkered ring-4 ring-white" />
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }}
                                        className="absolute -top-3 -right-3 p-2 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 transition-all border-2 border-white active:scale-90"
                                    >
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                    <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
                                        <FileImage size={14} />
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
                                disabled={!projectName || !selectedMunicipalityId || (isNewProduct && (!newProductName || !selectedBusinessId)) || (!isNewProduct && !selectedProductId)}
                                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-lg active:scale-95 font-bold text-[11px]"
                            >
                                {file || title ? '登録する' : 'プロジェクトのみ登録する'}
                            </button>
                        </div>
                    </div>
                )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
