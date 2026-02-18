
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../services/mockDb';
import { StatusBadge } from '../components/StatusBadge';
import { ImageEntity, Comment, ImageStatus } from '../types';
import { 
  Send, 
  ArrowLeft, 
  ChevronDown, 
  Clock, 
  Check, 
  X, 
  ExternalLink, 
  Link as LinkIcon, 
  QrCode, 
  Copy, 
  Download, 
  FileImage, 
  UploadCloud,
  Hash,
  Calendar,
  MessageSquare,
  History as HistoryIcon,
  ChevronRight,
  Zap,
  Maximize2,
  LayoutGrid,
  FileStack
} from 'lucide-react';

const STATUS_LABELS: Record<ImageStatus, string> = {
  draft: '下書き',
  pending_review: '承認待ち',
  approved: '承認済み',
  rejected: '差し戻し',
  revising: '修正中',
};

export const ImageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [image, setImage] = useState<ImageEntity | undefined>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareVersionAId, setCompareVersionAId] = useState<number | null>(null);
  const [compareVersionBId, setCompareVersionBId] = useState<number | null>(null);

  const isBusinessUser = currentUser?.role === 'business_user';

  const fetchData = useCallback(() => {
    const imgId = Number(id);
    const imgData = mockDb.getImageById(imgId);
    if (imgData) {
      setImage({ ...imgData, versions: [...imgData.versions] });
      // 初期表示は最新バージョン
      setSelectedVersionId(imgData.versions[imgData.versions.length - 1].id);
      setComments([...mockDb.getCommentsByImageId(imgId)]);
    }
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, [id, fetchData]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  const relatedImages = useMemo(() => {
    if (!image) return [];
    return mockDb.getImages().filter(img => img.product_id === image.product_id);
  }, [image]);

  if (!image || !currentUser) return null;

  const product = mockDb.getProductById(image.product_id);
  const business = product ? mockDb.getBusinessById(product.business_id) : null;
  const currentVersion = image.versions.find(v => v.id === selectedVersionId) || image.versions[image.versions.length - 1];
  const compareVersionA = isCompareMode ? image.versions.find(v => v.id === compareVersionAId) : null;
  const compareVersionB = isCompareMode ? image.versions.find(v => v.id === compareVersionBId) : null;

  const toggleCompareMode = () => {
    if (!isCompareMode && image.versions.length >= 2) {
      // デフォルト: A = 最新版, B = 1つ前のバージョン
      setCompareVersionAId(image.versions[image.versions.length - 1].id);
      setCompareVersionBId(image.versions[image.versions.length - 2].id);
      setIsCompareMode(true);
    } else {
      setIsCompareMode(false);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newComment.trim()) return;

    const comment = mockDb.addComment({
      image_id: image.id,
      commenter_type: currentUser.role === 'municipality_user' ? 'municipality' : (currentUser.role === 'business_user' ? 'business' : 'admin'),
      commenter_id: currentUser.id,
      commenter_name: currentUser.name,
      body: newComment,
    });

    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const handleUpdateStatus = (status: ImageStatus) => {
    mockDb.updateVersionStatus(image.id, currentVersion.id, status);
    setIsStatusMenuOpen(false);
    fetchData();
  };

  const copyToClipboard = (text: string, type: 'url' | 'asset') => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(type === 'url' ? '掲載URLをコピーしました' : '画像URLをコピーしました');
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const basePath = currentUser.role === 'municipality_user' ? '/municipality' : currentUser.role === 'business_user' ? '/business' : '/admin';

  return (
    <div className="flex h-full animate-in fade-in duration-700 bg-white">
      {/* Column 2: バナー形式一覧 */}
      <aside className="w-56 bg-white border-r border-slate-100 flex flex-col shrink-0 z-20 shadow-sm">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-900">
             <FileStack size={14} className="text-accent" />
             <h3 className="text-[10px] font-black uppercase tracking-widest">バナー形式一覧</h3>
          </div>
          <span className="bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full text-[9px] font-black">{relatedImages.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide p-2.5 space-y-1.5 bg-slate-50/20">
          {relatedImages.map((rel) => {
            const relVer = rel.versions[rel.versions.length - 1];
            const isActive = rel.id === image.id;
            return (
              <Link
                key={rel.id}
                to={`${basePath}/revisions/${rel.id}`}
                className={`flex flex-col gap-2 p-2.5 rounded-2xl border-2 transition-all group relative overflow-hidden ${
                  isActive 
                    ? 'border-accent bg-blue-50/50 shadow-md ring-2 ring-accent/5' 
                    : 'border-transparent bg-white hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className="aspect-[16/10] bg-white rounded-lg overflow-hidden border border-slate-200 shrink-0">
                  <img src={relVer.file_path} className={`w-full h-full object-cover transition-all duration-500 ${isActive ? 'scale-105' : 'group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100'}`} alt="" />
                </div>
                <div className="min-w-0">
                  <p className={`text-[9px] font-black truncate mb-1 ${isActive ? 'text-accent' : 'text-slate-900'}`}>{rel.title}</p>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={relVer.status} />
                    {isActive && <div className="w-1 h-1 bg-accent rounded-full" />}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Column 3: メインプレビュー */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/10">
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-8 py-3 shrink-0">
          <div className="flex justify-between items-center">
            <div className="space-y-1 flex-1 min-w-0">
              <button onClick={() => navigate(`${basePath}/images`)} className="flex items-center text-slate-400 hover:text-slate-900 font-black text-[9px] uppercase tracking-widest gap-2 transition-colors">
                <ArrowLeft size={10} /> 一覧へ戻る
              </button>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button 
                    onClick={() => !isBusinessUser && setIsStatusMenuOpen(!isStatusMenuOpen)}
                    className={`flex items-center gap-1.5 px-3 py-0.5 rounded-lg border font-black text-[10px] uppercase tracking-widest transition-all ${
                      isBusinessUser ? 'bg-slate-50 text-slate-400 cursor-default' : 'hover:bg-slate-50 shadow-sm'
                    }`}
                  >
                    <StatusBadge status={currentVersion.status} />
                    {!isBusinessUser && <ChevronDown size={12} className={`transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''}`} />}
                  </button>
                  
                  {isStatusMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-slate-100 z-[100] p-1.5 animate-in zoom-in-95 duration-200">
                      {(Object.keys(STATUS_LABELS) as ImageStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleUpdateStatus(s)}
                          className="w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition-colors flex items-center justify-between group"
                        >
                          <StatusBadge status={s} />
                          {currentVersion.status === s && <Check size={12} className="text-accent" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tighter truncate leading-none">{image.title}</h1>
              </div>

              {/* メタデータ 1行集約 */}
              <div className="flex items-center gap-3 text-[10px] font-bold whitespace-nowrap overflow-hidden">
                <div className="flex items-center gap-1 text-slate-400 shrink-0">
                    <span className="text-slate-500">{business?.name}</span>
                    <span className="text-slate-200">/</span>
                    <span className="text-slate-500">{product?.name}</span>
                </div>
                <div className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-500 flex items-center gap-0.5 shrink-0">
                    <Hash size={10} className="text-slate-300" />
                    {product?.product_code || '---'}
                </div>
                <div className="h-3 w-px bg-slate-100 shrink-0"></div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <code className="text-[9px] text-slate-300 font-mono select-all truncate max-w-[250px]">{currentVersion.file_path}</code>
                  <button onClick={() => copyToClipboard(currentVersion.file_path, 'asset')} className="p-1 hover:text-accent text-slate-200 transition-colors shrink-0"><Copy size={10} /></button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {image.versions.length >= 2 && (
                <button 
                  onClick={toggleCompareMode}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[10px] transition-all shadow-sm active:scale-95 ${
                    isCompareMode 
                      ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                      : 'bg-white border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <LayoutGrid size={14} /> A/B 比較
                </button>
              )}
              <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-[10px] hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                <Download size={14} /> 保存
              </button>
              {!isBusinessUser && (
                <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                  <UploadCloud size={14} /> 修正版アップ
                </button>
              )}
            </div>
          </div>
        </div>

        {/* コンパクト改修履歴バー */}
        <div className="bg-white border-b border-slate-100 px-8 py-2 flex items-center gap-4 shrink-0 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 text-slate-400 mr-1 shrink-0">
                <HistoryIcon size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">改修履歴</span>
            </div>
            <div className="flex gap-1.5">
              {[...image.versions].reverse().map((v) => (
                  <button 
                      key={v.id} 
                      onClick={() => setSelectedVersionId(v.id)}
                      className={`flex items-center gap-2.5 px-3 py-1 rounded-xl border-2 transition-all shrink-0 ${
                          selectedVersionId === v.id 
                            ? 'border-accent bg-blue-50/50 shadow-sm ring-2 ring-accent/5' 
                            : 'border-slate-50 bg-white hover:border-slate-200 shadow-sm'
                      }`}
                  >
                      <div className="w-8 h-5 rounded overflow-hidden border border-slate-100 shadow-inner">
                          <img src={v.file_path} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-black uppercase tracking-tighter ${selectedVersionId === v.id ? 'text-accent' : 'text-slate-400'}`}>V{v.version_number}</span>
                          <StatusBadge status={v.status} />
                      </div>
                  </button>
              ))}
            </div>
        </div>

        {/* プレビューエリア */}
        {isCompareMode && compareVersionA && compareVersionB ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* A/B バージョン選択バー */}
            <div className="bg-white border-b border-slate-100 px-8 py-2 flex items-center gap-6 shrink-0">
              <div className="flex items-center gap-2 flex-1">
                <span className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center text-[10px] font-black shadow-sm">A</span>
                <select
                  value={compareVersionAId ?? ''}
                  onChange={(e) => setCompareVersionAId(Number(e.target.value))}
                  className="bg-slate-50 border-0 rounded-lg px-3 py-1.5 text-[11px] font-bold outline-none cursor-pointer focus:bg-white transition-all flex-1"
                >
                  {image.versions.map(v => (
                    <option key={v.id} value={v.id}>V{v.version_number} — {STATUS_LABELS[v.status]}</option>
                  ))}
                </select>
              </div>
              <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">vs</div>
              <div className="flex items-center gap-2 flex-1">
                <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-sm">B</span>
                <select
                  value={compareVersionBId ?? ''}
                  onChange={(e) => setCompareVersionBId(Number(e.target.value))}
                  className="bg-slate-50 border-0 rounded-lg px-3 py-1.5 text-[11px] font-bold outline-none cursor-pointer focus:bg-white transition-all flex-1"
                >
                  {image.versions.map(v => (
                    <option key={v.id} value={v.id}>V{v.version_number} — {STATUS_LABELS[v.status]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* A/B 比較ビュー */}
            <div className="flex-1 flex bg-checkered relative overflow-hidden">
              {/* A パネル */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 border-r border-slate-200 relative">
                <div className="absolute top-3 left-3 z-10">
                  <span className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center text-[11px] font-black shadow-lg">A</span>
                </div>
                <div 
                  className="relative shadow-xl bg-white p-0.5 cursor-zoom-in group/imgA border border-slate-200/50"
                  onClick={() => { setSelectedVersionId(compareVersionA.id); setIsZoomOpen(true); }}
                >
                  <img src={compareVersionA.file_path} alt="Version A" className="max-w-full max-h-[55vh] object-contain" />
                  <div className="absolute top-3 right-3 shadow-lg"><StatusBadge status={compareVersionA.status} /></div>
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/imgA:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur p-3 rounded-full shadow-xl">
                      <Maximize2 size={18} className="text-slate-900" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 bg-blue-500/80 backdrop-blur text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg">
                  Version {compareVersionA.version_number}
                </div>
              </div>

              {/* B パネル */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                <div className="absolute top-3 left-3 z-10">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-[11px] font-black shadow-lg">B</span>
                </div>
                <div 
                  className="relative shadow-xl bg-white p-0.5 cursor-zoom-in group/imgB border border-slate-200/50"
                  onClick={() => { setSelectedVersionId(compareVersionB.id); setIsZoomOpen(true); }}
                >
                  <img src={compareVersionB.file_path} alt="Version B" className="max-w-full max-h-[55vh] object-contain" />
                  <div className="absolute top-3 right-3 shadow-lg"><StatusBadge status={compareVersionB.status} /></div>
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/imgB:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur p-3 rounded-full shadow-xl">
                      <Maximize2 size={18} className="text-slate-900" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 bg-emerald-500/80 backdrop-blur text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg">
                  Version {compareVersionB.version_number}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-checkered relative overflow-hidden">
            <div 
              className="relative shadow-2xl bg-white p-0.5 animate-in zoom-in duration-500 cursor-zoom-in group/img border border-slate-200/50"
              onClick={() => setIsZoomOpen(true)}
            >
               <img src={currentVersion.file_path} alt={image.title} className="max-w-full max-h-[60vh] object-contain shadow-inner rounded-none" />
               <div className="absolute top-4 right-4 shadow-xl"><StatusBadge status={currentVersion.status} /></div>
               <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur p-4 rounded-full shadow-2xl transform scale-90 group-hover/img:scale-100 transition-transform">
                      <Maximize2 size={24} className="text-slate-900" />
                  </div>
               </div>
            </div>
            
            <div className="mt-4 bg-slate-900/80 backdrop-blur text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl border border-white/10">
                Viewing Version {currentVersion.version_number}
            </div>
          </div>
        )}
      </div>

      {/* Column 4: メッセージ */}
      <aside className="w-[360px] bg-white border-l border-slate-100 flex flex-col shadow-2xl z-30">
        <div className="p-4 border-b border-slate-50 shrink-0 flex items-center justify-between bg-white">
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <MessageSquare size={14} className="text-accent" /> メッセージ
            <span className="bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded ml-1 font-mono text-[9px]">{comments.length}</span>
          </h3>
          <button className="p-1 text-slate-300 hover:text-slate-600 transition-colors"><Zap size={12} /></button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-6 min-h-0 bg-slate-50/10">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4 opacity-40">
                <MessageSquare size={32} />
                <p className="font-bold text-[10px]">まだメッセージはありません</p>
            </div>
          ) : comments.map((comment) => {
            const isMe = comment.commenter_id === currentUser.id;
            return (
              <div key={comment.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400 border border-slate-200 overflow-hidden uppercase">
                     {comment.commenter_name.slice(0, 1)}
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{comment.commenter_name}</span>
                </div>
                <div className={`relative max-w-[90%] p-3.5 rounded-2xl text-[13px] leading-relaxed ${
                  isMe ? 'bg-slate-900 text-white rounded-tr-none shadow-lg' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'
                }`}>
                  {comment.body}
                </div>
                <span className="text-[8px] text-slate-300 mt-1.5 font-mono">{new Date(comment.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="p-5 border-t border-slate-50 bg-white shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <form onSubmit={handleSendMessage} className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="メッセージを入力..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent focus:bg-white transition-all min-h-[80px] resize-none shadow-inner"
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSendMessage();
                  }
              }}
            />
            <button 
              type="submit"
              disabled={!newComment.trim()}
              className="absolute right-2 bottom-2 p-2.5 bg-slate-900 text-white rounded-xl hover:bg-accent disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-lg active:scale-90"
            >
              <Send size={16} />
            </button>
          </form>
          <p className="text-[8px] text-slate-300 mt-2 text-center font-bold uppercase tracking-widest">⌘ + ENTER で送信</p>
        </div>
      </aside>

      {/* モーダル表示 */}
      {isZoomOpen && (
        <div 
          className="fixed inset-0 z-[1000] bg-slate-900/95 flex items-center justify-center p-10 animate-in fade-in duration-300"
          onClick={() => setIsZoomOpen(false)}
        >
            <button className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors p-2">
                <X size={32} strokeWidth={1} />
            </button>
            <div className="relative max-w-full max-h-full flex items-center justify-center p-1 bg-white" onClick={(e) => e.stopPropagation()}>
                <img 
                  src={currentVersion.file_path} 
                  className="max-w-full max-h-[85vh] object-contain select-none shadow-2xl rounded-none" 
                  alt={image.title} 
                />
                <div className="absolute top-6 left-6">
                    <StatusBadge status={currentVersion.status} />
                </div>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center text-white/50 space-y-1">
                <p className="font-black text-base tracking-tighter text-white">{image.title}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.3em]">VERSION {currentVersion.version_number} • PREVIEW VIEW</p>
            </div>
        </div>
      )}

      {/* コピー完了通知 */}
      {copyFeedback && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-black shadow-2xl flex items-center gap-3 ring-4 ring-white/10">
                <Check size={16} className="text-emerald-400" />
                {copyFeedback}
            </div>
        </div>
      )}
    </div>
  );
};
