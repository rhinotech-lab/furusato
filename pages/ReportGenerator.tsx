
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb, BUSINESSES, MUNICIPALITIES } from '../services/mockDb';
import { FileText, Download, CheckCircle, Calendar, ChevronRight, Loader2, Printer, Share2, Sparkles, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const ReportGenerator: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState('2025-01');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const images = mockDb.getImages();
  const municipality = currentUser?.municipality_id ? mockDb.getMunicipalityById(currentUser.municipality_id) : null;

  // 承認済みかつ指定月の案件を抽出
  const approvedImages = useMemo(() => {
    return images.filter(img => {
      const latest = img.versions[img.versions.length - 1];
      if (latest.status !== 'approved') return false;
      
      const product = mockDb.getProductById(img.product_id);
      const business = product ? mockDb.getBusinessById(product.business_id) : null;
      if (currentUser?.role === 'municipality_user' && business?.municipality_id !== currentUser.municipality_id) return false;

      const date = new Date(latest.created_at);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthStr === selectedMonth;
    }).map(img => {
        const first = img.versions[0];
        const last = img.versions[img.versions.length - 1];
        const product = mockDb.getProductById(img.product_id);
        const business = product ? mockDb.getBusinessById(product.business_id) : null;
        return { ...img, first, last, product, business };
    });
  }, [images, selectedMonth, currentUser]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // 生成シミュレーション
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setShowPreview(true);
  };

  const handlePrint = () => {
      window.print();
  };

  if (showPreview) {
      return (
          <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-6 print:hidden">
                  <button onClick={() => setShowPreview(false)} className="flex items-center text-slate-400 hover:text-slate-900 font-bold text-[11px] uppercase tracking-widest gap-1.5">
                      <ArrowLeft size={12} /> 設定へ戻る
                  </button>
                  <div className="flex items-center gap-2">
                      <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-[11px] shadow-lg active:scale-95">
                          <Printer size={14} /> PDFとして保存 / 印刷
                      </button>
                      <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 shadow-sm transition-all">
                          <Share2 size={14} />
                      </button>
                  </div>
              </div>

              {/* 報告書プレビュー本体 */}
              <div className="bg-white shadow-xl rounded-2xl p-8 print:shadow-none print:p-0 border border-slate-100 print:border-0">
                  <div className="border-b-2 border-slate-900 pb-4 mb-8 flex justify-between items-end">
                      <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Completion Report</p>
                          <h1 className="text-xl font-black text-slate-900 tracking-tighter italic">ふるさと納税バナー制作 完了報告書</h1>
                      </div>
                      <div className="text-right">
                          <p className="text-[12px] font-bold text-slate-900">{municipality?.name}</p>
                          <p className="text-[11px] font-bold text-slate-400">作成日: {new Date().toLocaleDateString('ja-JP')}</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-10">
                      <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">対象期間</p>
                          <p className="text-[15px] font-black text-slate-900">{selectedMonth.replace('-', '年')}月分</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">完了案件数</p>
                          <p className="text-[15px] font-black text-slate-900">{approvedImages.length} <span className="text-[10px] font-bold">件</span></p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">平均修正回数</p>
                          <p className="text-[15px] font-black text-slate-900">1.4 <span className="text-[10px] font-bold">回 / 案件</span></p>
                      </div>
                  </div>

                  <div className="space-y-12">
                      {approvedImages.map((img, idx) => (
                          <div key={img.id} className="page-break-inside-avoid">
                              <div className="flex items-center justify-between mb-4 border-l-4 border-accent pl-4">
                                  <div>
                                      <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">{img.product?.name}</h3>
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{img.business?.name} - {img.title}</p>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">承認完了日</p>
                                      <p className="text-sm font-black text-slate-900">{new Date(img.last.created_at).toLocaleDateString('ja-JP')}</p>
                                  </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Before (初期案)</p>
                                      <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50 grayscale opacity-60">
                                          <img src={img.first.file_path} className="w-full h-full object-cover" alt="" />
                                      </div>
                                  </div>
                                  <div className="space-y-2">
                                      <p className="text-[9px] font-black text-accent uppercase tracking-widest px-1">After (最終納品)</p>
                                      <div className="aspect-video rounded-xl overflow-hidden border-2 border-accent shadow-lg bg-slate-50 relative">
                                          <img src={img.last.file_path} className="w-full h-full object-cover" alt="" />
                                          <div className="absolute top-3 right-3 bg-accent text-white p-0.5 rounded-full">
                                              <CheckCircle size={14} />
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                      <p className="text-[12px] font-bold text-slate-900 mb-2">【報告者 確認印】</p>
                      <div className="w-20 h-20 border-2 border-rose-500 rounded-full mx-auto flex flex-col items-center justify-center text-rose-500 font-bold transform -rotate-12">
                          <span className="text-[9px] border-b border-rose-200 w-full mb-0.5">承認済</span>
                          <span className="text-[11px]">{municipality?.name.slice(-3)}</span>
                          <span className="text-[8px] mt-0.5">{new Date().toLocaleDateString('ja-JP')}</span>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col">
          <h1 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              <FileText className="text-accent" size={20} />
              月次報告書・自動作成 (完了報告)
          </h1>
          <p className="text-sm text-slate-400 font-bold mt-2 leading-relaxed">
              月別の制作成果を自動で抽出し、修正前後の比較付きで見栄えの良い報告書を瞬時に作成します。
          </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-premium space-y-6">
              <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={12} /> 作成条件の設定
                  </h3>
                  
                  <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">対象月を指定</label>
                      <input 
                        type="month" 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl font-bold text-slate-900 text-sm outline-none focus:bg-white transition-all" 
                      />
                  </div>

                  <div className="p-4 bg-slate-900 rounded-[1.5rem] text-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/10 rounded-xl text-accent"><Sparkles size={16} /></div>
                          <div>
                              <p className="text-[12px] font-bold mb-0.5">AIによる分析・要約</p>
                              <p className="text-[10px] text-white/40 font-bold">制作の傾向や成果をAIが自動的に文章化します。</p>
                          </div>
                      </div>
                      <div className="w-10 h-5 bg-accent rounded-full p-0.5 flex justify-end">
                          <div className="w-4 h-4 bg-white rounded-full" />
                      </div>
                  </div>
              </div>

              <div className="pt-2">
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || approvedImages.length === 0}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-[11px] shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
                  >
                      {isGenerating ? (
                          <>
                              <Loader2 size={16} className="animate-spin" />
                              報告書を作成中...
                          </>
                      ) : (
                          <>
                              報告書のプレビューを確認
                              <ChevronRight size={14} />
                          </>
                      )}
                  </button>
                  {approvedImages.length === 0 && (
                      <p className="text-center text-[10px] font-black text-rose-500 uppercase tracking-widest mt-4">
                          選択した月に承認済みの案件がありません
                      </p>
                  )}
              </div>
          </div>

          <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100 flex flex-col justify-center gap-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-accent/20"></div>
              
              <div className="relative z-10 space-y-1">
                <h3 className="text-[14px] font-black text-slate-900 tracking-tight italic">事務作業をゼロにして、<br/>もっと「考える」時間へ。</h3>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                    毎月末の「比較資料作り」に追われる必要はありません。
                    システムが全案件のデータを集め、決裁ルートにそのまま回せる高品質なフォーマットで出力します。
                </p>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                      <div className="text-accent font-black text-[15px] mb-0.5 whitespace-nowrap">一瞬 (0秒)</div>
                      <p className="text-[9px] text-slate-400 font-black uppercase">抽出時間</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                      <div className="text-emerald-500 font-black text-[15px] mb-0.5 whitespace-nowrap">最高 (High)</div>
                      <p className="text-[9px] text-slate-400 font-black uppercase">出力品質</p>
                  </div>
              </div>
          </div>
      </div>

      <div className="pt-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">対象予定の案件 ({approvedImages.length}件)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {approvedImages.map(img => (
                <div key={img.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 transition-all hover:shadow-md">
                    <div className="w-16 h-10 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                        <img src={img.last.file_path} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-[11px] truncate">{img.product?.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">{img.title}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
