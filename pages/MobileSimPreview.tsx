
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockDb } from '../services/mockDb';
import { Smartphone, Search, Heart, ShoppingCart, ChevronLeft, Star, Share2, Info, LayoutGrid, Maximize2, AlertCircle } from 'lucide-react';

export const MobileSimPreview: React.FC = () => {
  const { id, versionId } = useParams<{ id: string, versionId: string }>();
  const [activePortal, setActivePortal] = useState<'rakuten' | 'satofull' | 'furunavi'>('rakuten');
  const [viewMode, setViewMode] = useState<'search' | 'detail'>('search');
  const [showGuide, setShowGuide] = useState(false);

  const image = useMemo(() => mockDb.getImageById(Number(id)), [id]);
  const version = useMemo(() => 
    image?.versions.find(v => v.id === Number(versionId)), 
  [image, versionId]);
  
  const product = useMemo(() => 
    image ? mockDb.getProductById(image.product_id) : null, 
  [image]);

  if (!image || !version) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-10 text-center">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h1 className="text-xl font-black mb-2">プレビューが見つかりません</h1>
        <p className="text-slate-400 text-sm">セッションが切れたか、URLが正しくありません。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 pb-20 select-none">
      {/* プレビュー設定バー（スマホ表示時はフローティング） */}
      <div className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex gap-2">
            {(['rakuten', 'satofull', 'furunavi'] as const).map(p => (
                <button 
                  key={p}
                  onClick={() => setActivePortal(p)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    activePortal === p ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                    {p === 'rakuten' ? '楽天' : p === 'satofull' ? 'さとふる' : 'ふるなび'}
                </button>
            ))}
        </div>
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className={`p-2 rounded-lg transition-all ${showGuide ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}
        >
          <Info size={18} />
        </button>
      </div>

      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        {/* モード切り替えタブ */}
        <div className="flex border-b border-slate-100 bg-white">
            <button onClick={() => setViewMode('search')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 ${viewMode === 'search' ? 'text-accent border-b-2 border-accent' : 'text-slate-400'}`}>
                <LayoutGrid size={14} /> 検索結果
            </button>
            <button onClick={() => setViewMode('detail')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 ${viewMode === 'detail' ? 'text-accent border-b-2 border-accent' : 'text-slate-400'}`}>
                <Maximize2 size={14} /> 商品詳細
            </button>
        </div>

        {/* 1. 検索結果シミュレーター */}
        {viewMode === 'search' && (
          <div className="p-4 space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full mb-4">
              <Search size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-600">ふるさと納税 {product?.genre}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* 今回のターゲット画像 */}
              <div className="space-y-2 relative">
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 relative shadow-sm border border-slate-100">
                    <img src={version.file_path} className="w-full h-full object-cover" alt="" />
                    {showGuide && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-1/2 h-1/2 border-2 border-amber-500 border-dashed rounded-md flex items-center justify-center">
                                <span className="bg-amber-500 text-white text-[8px] font-black px-1 rounded">可読限界域</span>
                            </div>
                        </div>
                    )}
                </div>
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => <Star key={i} size={8} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-[10px] font-bold text-slate-800 line-clamp-2 leading-snug">{product?.name}</p>
                  <p className="text-xs font-black text-rose-600 mt-1">10,000円</p>
                </div>
                <div className="absolute top-1 left-1 bg-accent text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">NEW</div>
              </div>

              {/* 他のモック商品 1 */}
              <div className="space-y-2 opacity-40">
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-200">
                  <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" className="w-full h-full object-cover" alt="" />
                </div>
                <p className="text-[10px] font-bold text-slate-800 line-clamp-2 leading-snug">他自治体の人気返礼品サンプル</p>
                <p className="text-xs font-black text-rose-600 mt-1">12,000円</p>
              </div>

              {/* 他のモック商品 2 */}
              <div className="space-y-2 opacity-40">
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-200">
                  <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400" className="w-full h-full object-cover" alt="" />
                </div>
                <p className="text-[10px] font-bold text-slate-800 line-clamp-2 leading-snug">全国から集まる美味しい野菜セット</p>
                <p className="text-xs font-black text-rose-600 mt-1">15,000円</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. 商品詳細シミュレーター */}
        {viewMode === 'detail' && (
          <div className="animate-in slide-in-from-right duration-300">
            {/* ポータル別ヘッダー再現 */}
            <div className={`p-4 flex items-center justify-between text-white ${
              activePortal === 'rakuten' ? 'bg-[#bf0000]' : activePortal === 'satofull' ? 'bg-[#ff8c00]' : 'bg-[#005bac]'
            }`}>
                <ChevronLeft size={20} />
                <span className="text-sm font-black tracking-tight">{activePortal.toUpperCase()} APP</span>
                <div className="flex gap-4">
                    <Share2 size={18} />
                    <Heart size={18} />
                </div>
            </div>

            {/* メイン画像プレビュー */}
            <div className="aspect-square bg-slate-100 relative">
                <img src={version.file_path} className="w-full h-full object-contain" alt="" />
                <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full">
                    1 / 5
                </div>
            </div>

            <div className="p-6 space-y-4">
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-rose-600">10,000</span>
                    <span className="text-sm font-black text-rose-600">円</span>
                    <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full ml-2">送料無料</span>
                </div>
                
                <h1 className="text-base font-black text-slate-900 leading-relaxed tracking-tight">
                    【ふるさと納税】{product?.name} 期間限定 数量限定 {product?.genre}
                </h1>

                <div className="flex items-center gap-4 py-4 border-y border-slate-100">
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-black text-amber-500">4.82</span>
                        <div className="flex gap-0.5"><Star size={8} className="fill-amber-400 text-amber-400" /></div>
                    </div>
                    <div className="h-8 w-px bg-slate-100"></div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">自治体名</p>
                        <p className="text-xs font-black text-slate-800">北海道札幌市</p>
                    </div>
                </div>

                <div className="py-2 space-y-4">
                    <p className="text-xs font-bold text-slate-500 leading-relaxed">
                        ここに商品説明文が入ります。スマホでは文字サイズが小さくなるため、バナー内の文字との対比を確認してください。
                    </p>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                        <p className="text-[10px] font-black text-slate-400">詳細情報をもっと見る</p>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* 固定フッターアクション */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-4 z-[110]">
          <div className="flex-1 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs uppercase tracking-widest">
            カートに入れる
          </div>
          <div className={`flex-[1.5] h-12 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xl active:scale-95 ${
            activePortal === 'rakuten' ? 'bg-[#bf0000]' : activePortal === 'satofull' ? 'bg-[#ff8c00]' : 'bg-[#005bac]'
          }`}>
            寄付手続きへ進む
          </div>
      </div>
      
      {showGuide && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] p-8 max-w-sm space-y-6 shadow-2xl">
                  <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
                      <AlertCircle size={32} />
                  </div>
                  <div className="text-center">
                      <h3 className="font-black text-slate-900 text-lg mb-2">視認性ガイドライン</h3>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">
                          中心の点線枠より小さい文字は、多くのスマホユーザーにとって「読みにくい」または「無視される」サイズです。<br/><br/>
                          特に「金額」や「限定」などの重要情報は、このガイドよりも大きく配置することを推奨します。
                      </p>
                  </div>
                  <button onClick={() => setShowGuide(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95">
                      了解しました
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};
