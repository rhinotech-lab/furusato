
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../services/mockDb';
import { Bell, MessageCircle, RefreshCw, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationList: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState(mockDb.getNotifications());

  const basePath = currentUser?.role === 'municipality_user' ? '/municipality' : '/admin';

  const markAllAsRead = () => {
    mockDb.markNotificationsAsRead();
    setNotifications(mockDb.getNotifications());
  };

  const getIcon = (title: string) => {
    if (title.includes('メッセージ') || title.includes('コメント')) return <MessageCircle size={18} className="text-blue-500" />;
    if (title.includes('ステータス')) return <RefreshCw size={18} className="text-emerald-500" />;
    return <Bell size={18} className="text-slate-400" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">通知履歴</h1>
          <p className="text-slate-400 font-medium mt-1">新着コメントや案件のステータス変更を確認できます。</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <CheckCircle2 size={16} /> すべて既読にする
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <Bell size={40} />
            </div>
            <p className="text-slate-300 font-black text-lg">通知はありません</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-6 lg:p-8 flex items-start gap-6 hover:bg-slate-50/80 transition-all group relative ${!n.is_read ? 'bg-blue-50/20' : ''}`}
              >
                {!n.is_read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                )}
                
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                  !n.is_read ? 'bg-white border-blue-100' : 'bg-slate-50 border-transparent'
                }`}>
                  {getIcon(n.title)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`font-black text-base tracking-tight ${!n.is_read ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</h3>
                    {!n.is_read && <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full uppercase tracking-widest">NEW</span>}
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{n.message}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      <Clock size={12} />
                      {new Date(n.created_at).toLocaleString('ja-JP')}
                    </div>
                    {/* プロトタイプ用：全ての通知を特定の画像ページへ飛ばすか、メッセージ内容から推測したリンクを貼る */}
                    <Link 
                      to={`${basePath}/images/1`} 
                      className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      詳細を見る <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>

                {!n.is_read && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50/50 rounded-[2.5rem] p-8 border border-blue-100/50 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-100 shrink-0">
          <Bell size={28} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-black text-slate-900 mb-1">通知設定のカスタマイズ</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            どのようなアクションで通知を受け取るか、ブラウザ通知の有無などを設定ページから変更できます。
          </p>
        </div>
        <Link 
          to={`${basePath}/users`}
          className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95 whitespace-nowrap"
        >
          設定を確認する
        </Link>
      </div>
    </div>
  );
};
