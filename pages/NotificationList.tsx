
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../services/mockDb';
import { Bell, MessageCircle, RefreshCw, ChevronRight, Clock, CheckCircle2, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationList: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState(mockDb.getNotifications());

  const basePath = currentUser?.role === 'municipality_user' ? '/municipality' : '/admin';

  const markAllAsRead = () => {
    mockDb.markNotificationsAsRead();
    // 新しい配列を作成してReactに変更を認識させる
    setNotifications([...mockDb.getNotifications()]);
    // カスタムイベントを発火してLayoutに通知
    window.dispatchEvent(new Event('notificationUpdated'));
  };

  const getIcon = (title: string) => {
    if (title.includes('メッセージ') || title.includes('コメント')) return <MessageCircle size={18} className="text-blue-500" />;
    if (title.includes('ステータス')) return <RefreshCw size={18} className="text-emerald-500" />;
    return <Bell size={18} className="text-slate-400" />;
  };

  // メッセージから画像タイトルを抽出して画像IDを取得
  const getImageIdFromMessage = (message: string): number | null => {
    // 「」で囲まれた部分を抽出（例：「2026年2月　肉類系」）
    const match = message.match(/「([^」]+)」/);
    if (!match) return null;
    
    const imageTitle = match[1];
    const images = mockDb.getImages();
    const image = images.find(img => img.title === imageTitle);
    
    return image ? image.id : null;
  };

  // 通知を既読にする
  const handleViewDetails = (notificationId: number) => {
    mockDb.markNotificationAsRead(notificationId);
    // 新しい配列を作成してReactに変更を認識させる
    setNotifications([...mockDb.getNotifications()]);
    // カスタムイベントを発火してLayoutに通知
    window.dispatchEvent(new Event('notificationUpdated'));
  };

  // 通知を未読に戻す
  const handleMarkAsUnread = (notificationId: number) => {
    mockDb.markNotificationAsUnread(notificationId);
    // 新しい配列を作成してReactに変更を認識させる
    setNotifications([...mockDb.getNotifications()]);
    // カスタムイベントを発火してLayoutに通知
    window.dispatchEvent(new Event('notificationUpdated'));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tighter">通知履歴</h1>
        </div>
        <button 
          onClick={markAllAsRead}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-[11px] hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <CheckCircle2 size={14} /> すべて既読にする
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-premium border border-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <Bell size={28} />
            </div>
            <p className="text-slate-300 font-bold text-[14px]">通知はありません</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`px-6 py-4 flex items-start gap-4 hover:bg-slate-50/80 transition-all group relative ${!n.is_read ? 'bg-blue-50/20' : ''}`}
              >
                {!n.is_read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                )}
                
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                  !n.is_read ? 'bg-white border-blue-100' : 'bg-slate-50 border-transparent'
                }`}>
                  {getIcon(n.title)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className={`font-bold text-[14px] tracking-tight ${!n.is_read ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</h3>
                    {!n.is_read && <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-black rounded-full">NEW</span>}
                  </div>
                  <p className="text-slate-500 text-[12px] leading-relaxed mb-2">{n.message}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
                      <Clock size={12} className="text-slate-500" />
                      <span className="text-[11px] font-black text-slate-700 font-mono">
                        {new Date(n.created_at).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    {(() => {
                      const imageId = getImageIdFromMessage(n.message);
                      return imageId ? (
                        <Link 
                          to={`${basePath}/revisions/${imageId}`} 
                          onClick={() => handleViewDetails(n.id)}
                          className="text-[9px] font-black text-accent hover:underline flex items-center gap-0.5"
                        >
                          詳細を見る <ChevronRight size={10} />
                        </Link>
                      ) : null;
                    })()}
                    {n.is_read && (
                      <button
                        onClick={() => handleMarkAsUnread(n.id)}
                        className="text-[9px] font-black text-slate-500 hover:text-slate-700 flex items-center gap-0.5 transition-colors"
                        title="未読に戻す"
                      >
                        <RotateCcw size={10} /> 未読に戻す
                      </button>
                    )}
                  </div>
                </div>

                {!n.is_read && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50/50 rounded-[1.5rem] p-5 border border-blue-100/50 flex flex-col md:flex-row items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-100 shrink-0">
          <Bell size={18} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-bold text-[14px] text-slate-900 mb-0.5">通知設定のカスタマイズ</h4>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            どのようなアクションで通知を受け取るか、ブラウザ通知の有無などを設定ページから変更できます。
          </p>
        </div>
        <Link 
          to={`${basePath}/users`}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[11px] hover:bg-slate-800 transition-all shadow-lg active:scale-95 whitespace-nowrap"
        >
          設定を確認する
        </Link>
      </div>
    </div>
  );
};
