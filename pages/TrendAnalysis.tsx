
import React, { useState, useMemo, useEffect } from 'react';
import { mockDb, MUNICIPALITIES } from '../services/mockDb';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { 
  Brain, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  Zap, 
  BarChart3, 
  ChevronRight, 
  MapPin,
  ArrowLeft,
  Building2,
  History,
  Grid,
  List
} from 'lucide-react';

export const TrendAnalysis: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedMuniId, setSelectedMuniId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setSelectedMuniId(idParam);
    }
  }, [searchParams]);

  const municipality = useMemo(() => 
    MUNICIPALITIES.find(m => m.id.toString() === selectedMuniId), 
  [selectedMuniId]);

  // 自治体ごとのモック分析データ
  const insights = useMemo(() => {
    if (!selectedMuniId) return null;
    
    if (selectedMuniId === '1') { // 札幌市
      return {
        ok: [
          { tag: '配色', detail: 'オレンジや赤などの暖色系を使用すると、承認率が向上する傾向にあります。', score: 92 },
          { tag: '文字', detail: '寄付金額などの重要情報は「特大かつ太字」での配置が好まれます。', score: 88 },
          { tag: '写真', detail: '調理後の「美味しそうな湯気」や「質感」が伝わる写真が優先されます。', score: 85 }
        ],
        ng: [
          { tag: '配色', detail: '青や紫などの寒色系は「食欲を減退させる」との理由で差し戻された履歴があります。', risk: '高' },
          { tag: '背景', detail: '複雑なテクスチャや柄物背景よりも、すっきりとしたシンプル構成が好まれます。', risk: '中' },
          { tag: 'レイアウト', detail: '左上の空白は避けてください。市章やロゴの配置が推奨されています。', risk: '低' }
        ],
        summary: "札幌市様は「伝統・温かみ・高級感」のバランスを重視されます。特に冬時期の案件では、冷たさを感じさせる青色を避けるだけで、承認までの日数が平均1.5日短縮される見込みです。",
        avgRevision: 1.2,
        winRate: 85
      };
    } else { // 福岡市など
      return {
        ok: [
          { tag: '配色', detail: 'コントラストの効いた鮮やかな色使いや、モダンな配色が好まれる傾向にあります。', score: 89 },
          { tag: 'フォント', detail: 'スタイリッシュなゴシック体を用いた、現代的なデザインが評価されやすいです。', score: 82 },
          { tag: '素材', detail: '生産者の顔や、産地の風景が見える透明性の高い素材が好まれます。', score: 78 }
        ],
        ng: [
          { tag: '文字', detail: '明朝体を多用しすぎると「印象が古い」と指摘を受ける可能性があります。', risk: '中' },
          { tag: '余白', detail: '情報を詰め込みすぎず、適度な余白を持たせた見やすい構成が求められます。', risk: '高' },
          { tag: 'ロゴ', detail: '市章の変形や色の変更については、非常に厳格なルールがあります。', risk: '致命的' }
        ],
        summary: "福岡市様は「洗練・モダン・透明性」がキーワードになることが多いです。最新のフラットデザインを取り入れることで、一発承認の確率を大幅に高めることができます。",
        avgRevision: 1.8,
        winRate: 72
      };
    }
  }, [selectedMuniId]);

  if (!selectedMuniId) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 pt-10">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-indigo-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-200 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Brain size={48} className="relative z-10" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">
              自治体別 傾向分析AI
            </h1>
            <p className="text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed text-sm lg:text-base">
              制作に着手する前に、自治体ごとの「好まれる傾向」を確認しましょう。<br/>
              過去数千件のフィードバックをAIが分析し、スムーズな承認をサポートします。
            </p>
          </div>
        </div>

        <div className="flex justify-end px-4">
          <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
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
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 animate-in fade-in zoom-in-95 duration-500">
            {MUNICIPALITIES.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMuniId(m.id.toString())}
                className="group bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-premium hover:shadow-2xl hover:-translate-y-2 transition-all text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full -mr-20 -mt-20 group-hover:bg-indigo-50 transition-colors" />
                <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-all shadow-lg">
                    <Building2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{m.name}</h3>
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-1">自治体コード: {m.code}</p>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-[0.2em] pt-2">
                    分析レポートを見る <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-8 py-5 border-b border-slate-100">自治体情報</th>
                    <th className="px-8 py-5 border-b border-slate-100">自治体コード</th>
                    <th className="px-8 py-5 border-b border-slate-100 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {MUNICIPALITIES.map(m => (
                    <tr 
                      key={m.id} 
                      onClick={() => setSelectedMuniId(m.id.toString())}
                      className="group hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Building2 size={20} />
                          </div>
                          <span className="font-black text-slate-900 text-base">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-mono text-slate-400 font-bold">{m.code}</span>
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
          </div>
        )}
      </div>
    );
  }

  // 分析結果表示画面
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 pb-20 pt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
        <div>
          <button 
            onClick={() => setSelectedMuniId(null)}
            className="flex items-center text-slate-400 hover:text-slate-900 transition-all mb-4 group text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 他の自治体を選択する
          </button>
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg">
                <Brain size={28} />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                  {municipality?.name} <span className="text-indigo-600 font-black">傾向分析結果</span>
                </h1>
                <p className="text-xs text-slate-500 font-bold mt-1">過去の承認履歴とフィードバックから導き出した「採用されやすい構成」</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl shadow-premium border border-slate-100">
           <MapPin size={16} className="text-indigo-500" />
           <span className="text-sm font-black text-slate-700">{municipality?.name}</span>
           <button 
             onClick={() => setSelectedMuniId(null)}
             className="ml-4 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline"
           >
             変更
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-slate-900 rounded-[3rem] p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] -mr-40 -mt-40"></div>
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full w-fit">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">AI分析サマリー</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight italic">
                「{insights?.summary.split('。')[0]}」
              </h2>
              <p className="text-lg text-white/70 font-medium leading-relaxed">
                {insights?.summary.split('。')[1]}
              </p>
              
              <div className="pt-8 flex gap-12 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">平均修正回数</span>
                  <div className="text-3xl font-black text-indigo-400">{insights?.avgRevision} <span className="text-xs font-bold text-white/40 ml-1">回</span></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">一発承認率</span>
                  <div className="text-3xl font-black text-emerald-400">{insights?.winRate}<span className="text-xs">%</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-premium">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                  <ThumbsUp size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">評価されやすい点</h3>
              </div>
              <div className="space-y-4">
                {insights?.ok.map((item, i) => (
                  <div key={i} className="group p-6 bg-slate-50/50 rounded-[2rem] border border-transparent hover:border-emerald-100 hover:bg-emerald-50/30 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-tight">{item.tag}</span>
                      <span className="text-[10px] font-black text-slate-300">適合率: {item.score}%</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-premium">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                  <ThumbsDown size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">差し戻し注意点</h3>
              </div>
              <div className="space-y-4">
                {insights?.ng.map((item, i) => (
                  <div key={i} className="group p-6 bg-slate-50/50 rounded-[2rem] border border-transparent hover:border-rose-100 hover:bg-rose-50/30 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-tight">{item.tag}</span>
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full ${
                        item.risk === '高' || item.risk === '致命的' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'
                      }`}>リスク: {item.risk}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <BarChart3 size={18} className="text-slate-400" />
              分析キーワード
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {['暖色系', '特大文字', 'シズル感', 'シンプル構成', '和モダン', 'ファミリー層', '視認性重視'].map(tag => (
                <span key={tag} className="px-4 py-2 bg-slate-50 text-slate-500 rounded-2xl text-xs font-bold border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all cursor-default">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50/50 rounded-[2.5rem] p-10 border border-indigo-100/50 relative overflow-hidden">
            <Zap className="absolute -right-6 -bottom-6 text-indigo-100 w-40 h-40 rotate-12" />
            <div className="relative z-10">
              <h3 className="text-xl font-black text-slate-900 mb-3 italic">制作のアドバイス</h3>
              <p className="text-sm text-slate-600 font-bold leading-relaxed mb-8">
                {municipality?.name}様は現在、情報の「詰め込み」よりも「一瞬での視認性」を非常に重視されています。タイトルは思い切って短くまとめ、画像を主役にする構成がおすすめです。
              </p>
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all hover:bg-slate-800">
                過去の承認済み案件を見る
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <History size={18} className="text-slate-400" />
              直近の審査トレンド
            </h3>
            <div className="space-y-5">
               <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] shrink-0" />
                  <p className="text-xs font-bold text-slate-600 leading-tight">「シズル感」重視の写真選定が評価されています</p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] shrink-0" />
                  <p className="text-xs font-bold text-slate-600 leading-tight">文字の「重なり」による可読性の低下に厳しいです</p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] shrink-0" />
                  <p className="text-xs font-bold text-slate-600 leading-tight">ロゴの配置バランスに微細な修正指示が集中</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
