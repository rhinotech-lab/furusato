
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDb, MUNICIPALITIES, BUSINESSES } from '../services/mockDb';
import { ArrowLeft, Plus, Edit, Image as ImageIcon, UploadCloud, X, FileImage, Link as LinkIcon } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { canUploadImage } from '../utils/permissions';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const product = id ? mockDb.getProductById(Number(id)) : null;
  const business = product ? mockDb.getBusinessById(product.business_id) : null;
  const municipality = business ? MUNICIPALITIES.find(m => m.id === business.municipality_id) : null;
  
  const [images, setImages] = useState(mockDb.getImages().filter(img => img.product_id === Number(id)));
  
  // 画像登録用のステート
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [title, setTitle] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (id) {
      setImages(mockDb.getImages().filter(img => img.product_id === Number(id)));
    }
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white text-slate-400 hover:text-slate-900 rounded-xl shadow-sm border border-slate-100 transition-all active:scale-90">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter">商品が見つかりません</h1>
          </div>
        </div>
      </div>
    );
  }

  const basePath = currentUser?.role === 'municipality_user' ? '/municipality' : '/admin';
  const canUpload = canUploadImage(currentUser);

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

  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !previewUrl) return;

    mockDb.addImage({
      product_id: product.id,
      title: title,
      external_url: externalUrl,
      created_by_admin_id: currentUser!.id,
      file_path: previewUrl
    });

    setImages(mockDb.getImages().filter(img => img.product_id === product.id));
    setShowUploadForm(false);
    setTitle('');
    setExternalUrl('');
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white text-slate-400 hover:text-slate-900 rounded-xl shadow-sm border border-slate-100 transition-all active:scale-90">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-slate-900 tracking-tighter">商品詳細</h1>
        </div>
        <Link 
          to={`${basePath}/products/${product.id}/edit`}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
        >
          <Edit size={16} />
          編集
        </Link>
      </div>

      {/* 商品情報 */}
      <div className="bg-white p-6 rounded-2xl shadow-premium border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">商品名</label>
            <p className="text-[16px] font-bold text-slate-900">{product.name}</p>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">商品コード</label>
            <p className="text-[14px] font-mono font-bold text-slate-600">{product.product_code || '---'}</p>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">事業者</label>
            <p className="text-[14px] font-bold text-slate-700">{business?.name || '---'}</p>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">自治体</label>
            <p className="text-[14px] font-bold text-slate-700">{municipality?.name || '---'}</p>
          </div>
          {product.description && (
            <div className="md:col-span-2">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">説明</label>
              <p className="text-[14px] font-bold text-slate-700">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* 画像一覧 */}
      <div className="bg-white p-6 rounded-2xl shadow-premium border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[14px] font-black text-slate-900 tracking-tight">登録済み画像 ({images.length})</h2>
          {canUpload && (
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              <Plus size={16} />
              {showUploadForm ? 'キャンセル' : '画像を登録'}
            </button>
          )}
        </div>

        {/* 画像登録フォーム */}
        {showUploadForm && canUpload && (
          <div className="mb-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <form onSubmit={handleImageSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  画像タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例: メインバナー、正方形サムネイルなど"
                  className="w-full px-4 py-2.5 bg-white border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-1.5">
                  <LinkIcon size={10} /> 外部リンクURL <span className="text-[9px] font-medium opacity-40 ml-1">(任意)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://item.rakuten.co.jp/..."
                  className="w-full px-4 py-2.5 bg-white border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all"
                  value={externalUrl}
                  onChange={e => setExternalUrl(e.target.value)}
                />
              </div>

              <div 
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  isDragging ? 'border-accent bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 bg-white'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !file && document.getElementById('file-upload-product')?.click()}
              >
                {!file ? (
                  <>
                    <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-4 text-slate-300 shadow-sm border border-slate-200">
                      <UploadCloud size={24} />
                    </div>
                    <p className="font-bold text-slate-900 text-sm">クリックしてアップロード</p>
                    <p className="text-[11px] text-slate-400 font-bold mt-1">またはドラッグ＆ドロップ</p>
                    <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-4">PNG, JPG up to 10MB</p>
                    <input 
                      id="file-upload-product" 
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

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false);
                    setTitle('');
                    setExternalUrl('');
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                  className="px-6 py-2.5 text-slate-400 bg-white hover:bg-slate-50 rounded-xl font-bold text-sm transition-all"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={!file || !title}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-lg active:scale-95 font-bold text-sm"
                >
                  画像を登録する
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 画像リスト */}
        {images.length === 0 ? (
          <div className="text-center py-12 text-slate-300">
            <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-bold text-sm">登録されている画像はありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {images.map(image => {
              const latestVersion = image.versions[image.versions.length - 1];
              return (
                <Link
                  key={image.id}
                  to={`${basePath}/revisions/${image.id}`}
                  className="block p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white rounded-lg overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                      {latestVersion.file_path ? (
                        <img src={latestVersion.file_path} alt={image.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={24} className="text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{image.title}</h3>
                        <StatusBadge status={latestVersion.status} />
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 font-bold">
                        <span>バージョン: {image.versions.length}</span>
                        <span>最終更新: {new Date(latestVersion.created_at).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
