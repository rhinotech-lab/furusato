
import React, { useState, useMemo } from 'react';
import { LayoutGrid, TrendingUp, Sparkles, Filter, Search, ChevronRight, Award, Flame, Heart, Info, Grid, List, Image as ImageIcon } from 'lucide-react';

interface CatalogItem {
  id: number;
  region: string;
  genre: string;
  style: string[];
  imageUrl: string;
  insight: string;
  trendScore: number;
  likes: number;
}

const MOCK_CATALOG: CatalogItem[] = [
  {
    id: 1,
    region: "北日本の自治体",
    genre: "肉類",
    style: ["シズル感", "高級感"],
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    insight: "調理後の湯気と脂の光沢を強調。背景を暗くすることで、肉の赤身を際立たせています。昨今の『おうち贅沢』トレンドに合致。",
    trendScore: 98,
    likes: 124
  },
  {
    id: 2,
    region: "九州の自治体",
    genre: "魚介類",
    style: ["文字情報凝縮", "産地直送感"],
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80",
    insight: "『朝獲れ』『直送』の文字を太字で配置。鮮度を視覚的に伝えるため、寒色系の背景に白抜き文字で清潔感を演出。",
    trendScore: 92,
    likes: 89
  },
  {
    id: 3,
    region: "四国の自治体",
    genre: "果物",
    style: ["フレッシュ", "贈答用"],
    imageUrl: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=800&q=80",
    insight: "断面を見せることで果汁の豊富さを表現。明るい太陽光を感じさせるライティングが、安心感と美味しさを引き出しています。",
    trendScore: 85,
    likes: 156
  },
  {
    id: 4,
    region: "東日本の自治体",
    genre: "日用品",
    style: ["シンプル", "清潔感"],
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    insight: "日常の生活シーンに溶け込む配置。過度な装飾を避け、『質の良い暮らし』をイメージさせる余白の使い方が評価されています。",
    trendScore: 78,
    likes: 42
  }
];

export const TrendCatalog: React.FC = () => {
  const [filterGenre, setFilterGenre] = useState('全て');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const genres = ['全て', '肉類', '魚介類', '果物', '野菜', '日用品'];

  const filteredItems = useMemo(() => {
    if (filterGenre === '全て') return MOCK_CATALOG;
    return MOCK_CATALOG.filter(item => item.genre === filterGenre);
  }, [filterGenre]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      {/* ヒーローセクション */}
      <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 p-12 lg:p-16 text-white shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/20 to-transparent"></div>
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full w-fit">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Global Trend Analysis</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter italic leading-tight">
            自治体横断：<br/><span className="text-indigo-400">バナー・トレンド図鑑</span>
          </h1>
          <p className="text-lg text-white/60 font-medium leading-relaxed">
            全国の成功事例から学ぶ、最新の寄付獲得デザイン。
            AIが解析した「なぜ選ばれるか」のインサイトと共に、次の制作のヒントを見つけましょう。
          </p>
        </div>
        <TrendingUp className="absolute bottom-12 right-12 text-white/5 w-64 h-64" />
      </div>

      {/* フィルターバー */}
      <div className="flex flex-wrap items-center justify-between gap-6 bg-white p-4 rounded-[2rem] shadow-premium border border-slate-100">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setFilterGenre(g)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                filterGenre === g ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
            {/* 表示モードトグル */}
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                title="グリッド表示"
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                title="リスト表示"
              >
                <List size={18} />
              </button>
            </div>

            <div className="relative w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input type="text" placeholder="キーワードで探す..." className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl text-xs font-bold outline-none focus:bg-white transition-all" />
            </div>
        </div>
      </div>

      {/* ギャラリー */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in zoom-in-95 duration-500">
            {filteredItems.map(item => (
            <div 
                key={item.id}
                className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-premium transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
            >
                {/* メインビジュアル */}
                <div className="aspect-[16/9] overflow-hidden relative">
                <img src={item.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* トレンドスコア */}
                <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl">
                    <Flame size={16} className="text-orange-500" />
                    <span className="text-sm font-black text-slate-900">{item.trendScore}% <span className="text-[10px] text-slate-400 font-bold ml-1">Trend</span></span>
                </div>

                {/* いいね */}
                <button className="absolute top-6 right-6 w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-xl active:scale-90">
                    <Heart size={20} className={item.likes > 100 ? "fill-rose-500 text-rose-500" : ""} />
                </button>
                </div>

                {/* コンテンツ */}
                <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{item.region}</p>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{item.genre}カテゴリの成功事例</h3>
                    </div>
                    <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100">
                    {item.genre}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2">
                    {item.style.map(s => (
                    <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black border border-indigo-100">#{s}</span>
                    ))}
                </div>

                {/* インサイト表示 */}
                <div className="pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2 mb-3">
                    <Info size={14} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Insight</span>
                    </div>
                    <p className="text-sm text-slate-600 font-bold leading-relaxed">
                    {item.insight}
                    </p>
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-4 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">
                    このトレンドを詳しく見る <ChevronRight size={14} />
                </button>
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
                        <th className="px-8 py-5 border-b border-slate-100">デザインプレビュー</th>
                        <th className="px-6 py-5 border-b border-slate-100">地域 / ジャンル</th>
                        <th className="px-6 py-5 border-b border-slate-100">スコア</th>
                        <th className="px-6 py-5 border-b border-slate-100">AI分析インサイト</th>
                        <th className="px-8 py-5 border-b border-slate-100 text-right"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredItems.map(item => (
                        <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-900 text-sm italic">{item.genre}カテゴリ</span>
                                        <div className="flex gap-1 mt-1">
                                            {item.style.map(s => <span key={s} className="text-[9px] font-black text-indigo-400">#{s}</span>)}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-6">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.region}</span>
                                    <span className="text-xs font-bold text-slate-400">{item.genre}</span>
                                </div>
                            </td>
                            <td className="px-6 py-6">
                                <div className="flex items-center gap-1.5">
                                    <Flame size={14} className="text-orange-500" />
                                    <span className="font-black text-slate-900 text-sm">{item.trendScore}%</span>
                                </div>
                            </td>
                            <td className="px-6 py-6">
                                <p className="text-[11px] font-bold text-slate-500 leading-relaxed max-w-sm line-clamp-2">
                                    {item.insight}
                                </p>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <button className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                    <ChevronRight size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {/* ボトムバナー */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-black tracking-tight">デザインで寄付額は変わる。</h3>
          <p className="text-white/70 font-bold text-sm">最新トレンドを制作チームに共有して、より効果的なバナーを作りましょう。</p>
        </div>
        <button className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">
          制作チームへ指示を送る
        </button>
      </div>
    </div>
  );
};
