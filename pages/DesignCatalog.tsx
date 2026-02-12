
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  CheckCircle2, 
  Zap, 
  Palette, 
  Type, 
  Star, 
  Target, 
  X,
  Copy,
  ChevronRight,
  Flame,
  Award,
  Sparkles,
  Smartphone,
  LayoutGrid,
  List,
  Grid
} from 'lucide-react';
import { MUNICIPALITIES } from '../services/mockDb';

interface DesignRecipe {
  id: number;
  title: string;
  category: string;
  municipality: string;
  styleTags: string[];
  imageUrl: string;
  revisionCount: number;
  colors: { name: string; hex: string }[];
  fonts: string[];
  copy: string;
  insight: string;
}

const CATEGORIES = ["肉", "魚介", "フルーツ", "米・パン", "先行予約", "緊急支援"];

const MOCK_RECIPES: DesignRecipe[] = [
  {
    id: 1,
    title: "厚切り特選和牛ステーキ",
    category: "肉",
    municipality: "北海道札幌市",
    styleTags: ["#シズル感重視", "#背景暗め", "#高級感"],
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    revisionCount: 0,
    colors: [{ name: "メインブラック", hex: "#1A1A1A" }, { name: "アクセントゴールド", hex: "#D4AF37" }],
    fonts: ["源ノ明朝 (Bold)", "游明朝"],
    copy: "口の中でとろける、究極の贅沢。",
    insight: "札幌市の担当者は背景を暗く落とし、被写体の肉の赤みを際立たせるライティングを好まれます。文字は細めの明朝体で高級感を演出するのが鉄板です。"
  },
  {
    id: 2,
    title: "朝獲れ 輝く生いくら 1kg",
    category: "魚介",
    municipality: "北海道札幌市",
    styleTags: ["#文字デカ", "#背景抜き", "#白抜き文字"],
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80",
    revisionCount: 0,
    colors: [{ name: "ジャパンブルー", hex: "#003366" }, { name: "フレッシュホワイト", hex: "#FFFFFF" }],
    fonts: ["源ノ角ゴシック (Black)", "UD新ゴ"],
    copy: "弾ける鮮度。産地直送の輝き。",
    insight: "札幌市様は「一目で中身がわかること」を非常に重視されます。背景をシンプルにし、大きな白抜き文字で商品名を載せると一発OKが出やすいです。"
  },
  {
    id: 3,
    title: "完熟マンゴー 2玉ギフト",
    category: "フルーツ",
    municipality: "福岡県福岡市",
    styleTags: ["#断面見せ", "#ファミリー向け", "#フレッシュ"],
    imageUrl: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=800&q=80",
    revisionCount: 1,
    colors: [{ name: "マンゴーオレンジ", hex: "#FFA500" }, { name: "サンシャインイエロー", hex: "#FFD700" }],
    fonts: ["筑紫明朝", "UD丸ゴ"],
    copy: "南国の太陽を、そのままお届け。",
    insight: "福岡市様は「洗練された清潔感」を好まれます。果物の断面を見せることで鮮度を視覚化し、自然光に近い明るいトーンでまとめると評価が高いです。"
  },
  {
    id: 4,
    title: "【先行予約】特大タラバガニ",
    category: "先行予約",
    municipality: "北海道札幌市",
    styleTags: ["#期間限定", "#文字デカ", "#インパクト"],
    imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80",
    revisionCount: 0,
    colors: [{ name: "バーニングレッド", hex: "#E60012" }, { name: "スノーホワイト", hex: "#FFFFFF" }],
    fonts: ["極太楷書体", "源ノ角ゴシック"],
    copy: "今だけ、このサイズ。予約受付中。",
    insight: "先行予約案件では、いかに「今しかない感」を出すかが鍵。赤背景に黄色のアクセントなど、楽天等のポータルで目立つ配色が好まれます。"
  }
];

export const DesignCatalog: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState('全て');
  const [filterMuni, setFilterMuni] = useState('全て');
  const [selectedRecipe, setSelectedRecipe] = useState<DesignRecipe | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredRecipes = useMemo(() => {
    return MOCK_RECIPES.filter(r => {
      const matchCat = filterCategory === '全て' || r.category === filterCategory;
      const matchMuni = filterMuni === '全て' || r.municipality === filterMuni;
      return matchCat && matchMuni;
    });
  }, [filterCategory, filterMuni]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      {/* ヒーロー */}
      <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 p-12 lg:p-16 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/20 to-transparent"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit border border-white/20">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Winning Design Cookbook</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-tight italic">
            制作担当者専用：<br/><span className="text-indigo-400">勝てるデザイン見本帳</span>
          </h1>
          <p className="text-lg text-white/60 font-medium max-w-xl">
            「札幌市は文字デカめが好き」「福岡市はモダンな断面を好む」など、
            自治体ごとの「一発OKのコツ」を凝縮したデザインレシピ集です。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* メインギャラリーエリア */}
        <div className="lg:col-span-3 space-y-8">
          {/* カテゴリクイック検索 & 表示切替 */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-premium border border-slate-100 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <LayoutGrid size={14} /> デザインレシピ検索
              </h3>
              
              <div className="flex items-center gap-4">
                 {/* 表示モードトグル */}
                 <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                      <Grid size={16} />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                      <List size={16} />
                    </button>
                 </div>

                 <select 
                    className="px-4 py-2 bg-slate-50 border-0 rounded-xl text-[11px] font-black outline-none cursor-pointer hover:bg-indigo-50 transition-all appearance-none"
                    value={filterMuni}
                    onChange={(e) => setFilterMuni(e.target.value)}
                  >
                    <option value="全て">全ての自治体</option>
                    {MUNICIPALITIES.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {["全て", ...CATEGORIES].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${
                    filterCategory === cat 
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ギャラリー表示 */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
              {filteredRecipes.map(recipe => (
                <div 
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-premium hover:shadow-2xl transition-all duration-500 cursor-pointer"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img src={recipe.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    
                    {/* 一発OKラベル */}
                    {recipe.revisionCount === 0 && (
                      <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2 animate-pulse">
                        <Award size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">修正0回でパス！</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-black text-xs shadow-2xl">レシピを分解表示</span>
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{recipe.municipality}</span>
                        <span className="text-slate-200">/</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{recipe.category}</span>
                      </div>
                      <h3 className="font-black text-slate-900 text-xl leading-tight truncate">{recipe.title}</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.styleTags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black border border-slate-100">{tag}</span>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                        <Star size={18} className="fill-current" />
                      </div>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed italic">
                        自治体コメント: 「{recipe.insight.slice(0, 45)}...」
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* リスト表示 */
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-8 py-5 border-b border-slate-50">プレビュー / レシピ名</th>
                    <th className="px-6 py-5 border-b border-slate-50">自治体 / カテゴリ</th>
                    <th className="px-6 py-5 border-b border-slate-50">実績</th>
                    <th className="px-6 py-5 border-b border-slate-50">スタイルタグ</th>
                    <th className="px-8 py-5 border-b border-slate-50 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredRecipes.map(recipe => (
                    <tr 
                      key={recipe.id} 
                      onClick={() => setSelectedRecipe(recipe)}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <img src={recipe.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          </div>
                          <span className="font-black text-slate-900 text-sm italic">{recipe.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{recipe.municipality}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{recipe.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        {recipe.revisionCount === 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-100">
                            <Award size={12} /> 一発OK
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400">修正 {recipe.revisionCount}回</span>
                        )}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-wrap gap-1">
                          {recipe.styleTags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] font-black text-slate-400">#{tag.replace('#', '')}</span>
                          ))}
                          {recipe.styleTags.length > 2 && <span className="text-[9px] font-black text-slate-300">...</span>}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <ChevronRight size={16} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* サイドバー：盛り文字・あしらい素材 */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium sticky top-24">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Download size={18} className="text-indigo-500" />
              盛り文字テンプレート集
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mb-8 leading-relaxed">
              よく使う装飾文字の透過PNG素材です。
              ダウンロードしてPhotoshop/Illustratorで使用できます。
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {["期間限定", "先行予約", "楽天限定", "増量中", "緊急支援", "一等賞"].map(text => (
                <div key={text} className="aspect-square bg-slate-50 rounded-[1.5rem] border border-slate-100 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-all cursor-pointer group">
                  <div className="text-[10px] font-black text-slate-800 bg-white px-2 py-1 rounded shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    {text}
                  </div>
                  <Download size={12} className="text-slate-300 group-hover:text-indigo-500" />
                </div>
              ))}
            </div>

            <button className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all">
              全ての素材を見る
            </button>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
             <div className="flex items-center gap-2 mb-4">
                <Smartphone size={16} className="text-indigo-400" />
                <h4 className="text-xs font-black uppercase tracking-widest">Mobile Optimized</h4>
             </div>
             <p className="text-[11px] font-bold text-white/50 leading-relaxed">
                現在のトレンドは、スマホの検索画面でいかに「文字が潰れないか」です。Recipe詳細から可読性チェック済みのフォント構成をコピーできます。
             </p>
          </div>
        </div>
      </div>

      {/* 詳細モーダル：デザインレシピ分解 */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[500] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-500">
            {/* 左側：プレビュー */}
            <div className="md:w-3/5 bg-slate-50 p-10 flex flex-col items-center justify-center relative border-r border-slate-100">
              <div className="relative group max-w-full">
                <img src={selectedRecipe.imageUrl} alt="" className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl object-contain ring-1 ring-slate-200" />
                {/* 補助線シミュレーション */}
                <div className="absolute inset-0 border-2 border-indigo-500/20 border-dashed rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-indigo-500/40 text-[10px] font-black uppercase tracking-widest">Composition Grid</div>
              </div>
              
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-10 left-10 p-4 bg-white/90 backdrop-blur-md rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-xl border border-slate-100 active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            {/* 右側：レシピ内容 */}
            <div className="md:w-2/5 p-12 overflow-y-auto space-y-12 bg-white">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {selectedRecipe.revisionCount === 0 ? "一発OK事例" : "修正1回以内"}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedRecipe.municipality} 公認</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic">{selectedRecipe.title}</h2>
              </div>

              {/* カラーパレット */}
              <section className="space-y-5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Palette size={14} className="text-indigo-500" /> Main Colors
                </h4>
                <div className="flex gap-6">
                  {selectedRecipe.colors.map(c => (
                    <div key={c.hex} className="group flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-[1.8rem] shadow-xl border border-slate-100 group-hover:scale-110 transition-transform cursor-pointer relative" style={{ backgroundColor: c.hex }}>
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy size={16} className="text-white mix-blend-difference" />
                         </div>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-900 mb-0.5">{c.name}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">{c.hex}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* フォント */}
              <section className="space-y-5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Type size={14} className="text-indigo-500" /> Font Selection
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {selectedRecipe.fonts.map(f => (
                    <div key={f} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                      <span className="text-sm font-black text-slate-700">{f}</span>
                      <Copy size={14} className="text-slate-200 group-hover:text-indigo-500 cursor-pointer" />
                    </div>
                  ))}
                </div>
              </section>

              {/* キャッチコピー */}
              <section className="space-y-5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Target size={14} className="text-indigo-500" /> Winning Copy
                </h4>
                <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] relative group shadow-inner">
                  <p className="text-2xl font-black text-indigo-900 italic leading-snug">「{selectedRecipe.copy}」</p>
                  <button className="absolute top-6 right-6 p-2 text-indigo-300 hover:text-indigo-600 transition-colors">
                    <Copy size={16} />
                  </button>
                </div>
              </section>

              {/* 自治体別ノウハウ */}
              <section className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden">
                <Sparkles className="absolute -right-4 -bottom-4 text-white/5 w-24 h-24" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{selectedRecipe.municipality} 担当者のこだわり</span>
                  </div>
                  <p className="text-xs font-bold leading-relaxed text-white/80">
                    {selectedRecipe.insight}
                  </p>
                </div>
              </section>

              <button className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95">
                デザイン素材をダウンロード
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
