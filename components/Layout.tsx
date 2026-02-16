
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Store, 
  ShoppingBag, 
  Bell, 
  LogOut,
  Menu,
  Settings as SettingsIcon,
  User as UserIcon,
  Image as ImageIcon,
  BarChart3,

  History,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { MUNICIPALITIES, mockDb, PRODUCTS, BUSINESSES } from '../services/mockDb';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifications] = useState(mockDb.getNotifications());

  if (!currentUser) return <>{children}</>;

  const theme = { 
    bg: 'bg-[#0f172a]', 
    text: 'text-white', 
    muted: 'text-slate-400', 
    activeBg: 'bg-accent', 
    activeText: 'text-white', 
    profileBg: 'bg-slate-800/50', 
    border: 'border-white/10', 
    logo: 'text-sky-400' 
  };

  const getMunicipalityName = () => {
    if ((currentUser.role === 'municipality_user' || currentUser.role === 'business_user') && currentUser.municipality_id) {
      return MUNICIPALITIES.find(m => m.id === currentUser.municipality_id)?.name;
    }
    return '';
  };

  const getBusinessName = () => {
    if (currentUser.role === 'business_user' && currentUser.business_id) {
        return BUSINESSES.find(b => b.id === currentUser.business_id)?.name;
    }
    return '';
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'システム管理者';
      case 'creator': return '制作担当者';
      case 'municipality_user': return '自治体担当者';
      case 'business_user': return '事業者（承認用）';
      default: return role;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const basePath = currentUser.role === 'municipality_user' ? '/municipality' : currentUser.role === 'business_user' ? '/business' : '/admin';

  const menuItems = [
    { label: 'ホーム', path: basePath, icon: <LayoutDashboard size={18} />, roles: ['super_admin', 'creator', 'municipality_user', 'business_user'], badge: null },
    { label: '通知履歴', path: `${basePath}/notifications`, icon: <Bell size={18} />, roles: ['super_admin', 'creator', 'municipality_user', 'business_user'], badge: unreadCount > 0 ? unreadCount : null, badgeColor: 'bg-red-500' },
    { label: '自治体一覧', path: '/admin/municipalities', icon: <Building2 size={18} />, roles: ['super_admin', 'creator'], badge: null },
    { label: '事業者一覧', path: `${basePath}/businesses`, icon: <Store size={18} />, roles: ['super_admin', 'municipality_user', 'creator'], badge: null },

    { label: '商品一覧', path: `${basePath}/products`, icon: <ShoppingBag size={18} />, roles: ['super_admin', 'creator', 'municipality_user', 'business_user'], badge: null },
    { label: '案件一覧', path: `${basePath}/images`, icon: <ImageIcon size={18} />, roles: ['super_admin', 'creator', 'municipality_user', 'business_user'], badge: null },
    { label: '設定', path: `${basePath}/users`, icon: <SettingsIcon size={18} />, roles: ['super_admin', 'creator', 'municipality_user', 'business_user'], badge: null },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(currentUser.role));
  
  const isActive = (path: string) => {
      const currentPath = location.pathname + location.search;
      if (path.includes('?')) return currentPath === path;
      if (path === '/admin' || path === '/municipality' || path === '/business') return location.pathname === path;
      
      if (path.endsWith('/images')) {
        return (location.pathname.startsWith(path) || location.pathname.includes('/revisions/')) && !location.search.includes('status=');
      }

      return location.pathname.startsWith(path) && !location.search.includes('status=');
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans text-slate-900">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 ${isCollapsed ? 'w-16' : 'w-60'} ${theme.bg} ${theme.text} transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full overflow-hidden">
          <div className={`p-6 pb-4 transition-all duration-300 ${isCollapsed ? 'p-4 text-center' : 'text-left'} shrink-0 relative`}>
            <div className={`flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
              {!isCollapsed ? (
                <>
                  <span className={`${theme.logo} text-[9px] font-black tracking-[0.2em] mb-1 uppercase`}>Furusato Tax</span>
                  <h1 className={`text-lg font-black tracking-tighter ${theme.text} leading-tight whitespace-nowrap`}>制作管理システム</h1>
                </>
              ) : (
                <div className={`${theme.logo} w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-[10px]`}>
                  ふる
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`hidden lg:flex absolute transition-all duration-300 items-center justify-center text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-white/10 shadow-xl z-20 ${isCollapsed ? 'top-8 left-1/2 -translate-x-1/2 w-6 h-6' : 'top-8 right-4 w-6 h-6'}`}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>
          
          <nav className={`flex-1 overflow-y-auto px-3 space-y-1 mt-6 scrollbar-hide pb-10 transition-all ${isCollapsed ? 'px-2' : 'px-3'}`}>
            {filteredMenu.map((item) => (
              <Link
                key={item.label + item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative ${
                  isActive(item.path) 
                    ? `${theme.activeBg} ${theme.activeText} font-bold shadow-lg shadow-black/10` 
                    : `${theme.muted} hover:${theme.text} hover:bg-white/5`
                } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${isActive(item.path) ? 'text-white' : 'text-slate-500'}`}>{item.icon}</div>
                  {!isCollapsed && <span className="text-[12px]">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge != null && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${typeof item.badge === 'string' && item.badge.length > 2 ? 'bg-white/10 text-white/60' : (isActive(item.path) ? 'bg-white text-accent' : (item.badgeColor || 'bg-blue-500') + ' text-white shadow-sm')}`}>
                    {item.badge}
                  </span>
                )}
                {isCollapsed && item.badge != null && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-[#0f172a]"></div>
                )}
              </Link>
            ))}
          </nav>

          <div className={`p-4 shrink-0 border-t border-white/5 bg-[#0f172a] transition-all ${isCollapsed ? 'p-2' : 'p-4'}`}>
            <div className={`${theme.profileBg} rounded-xl border ${theme.border} shadow-inner transition-all ${isCollapsed ? 'p-2 flex flex-col items-center' : 'p-3'}`}>
                <div className={`flex items-center gap-2.5 ${isCollapsed ? 'mb-0 flex-col' : 'mb-3'}`}>
                  <div className={`w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white font-black shadow-lg shrink-0 border border-white/10`}>
                    <UserIcon size={16} />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-xs font-bold truncate ${theme.text}`}>{currentUser.name}</p>
                      <p className={`text-[9px] ${theme.muted} truncate font-bold mt-0.5 uppercase tracking-tighter`}>
                        {currentUser.role === 'business_user' ? getBusinessName() : currentUser.role === 'municipality_user' ? getMunicipalityName() : getRoleLabel(currentUser.role)}
                      </p>
                    </div>
                  )}
                </div>
                {!isCollapsed ? (
                  <button onClick={logout} className={`flex items-center justify-center gap-2 w-full px-3 py-1.5 text-[10px] font-bold ${theme.muted} hover:${theme.text} bg-white/5 hover:bg-white/10 rounded-lg transition-all border ${theme.border}`}>
                    <LogOut size={12} /> ログアウト
                  </button>
                ) : (
                  <button onClick={logout} title="ログアウト" className={`mt-2 p-1.5 rounded-lg ${theme.muted} hover:${theme.text} hover:bg-white/5 transition-all`}>
                    <LogOut size={14} />
                  </button>
                )}
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 h-14 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 shrink-0">
          <button className="lg:hidden p-2 text-slate-400" onClick={() => setIsMobileMenuOpen(true)}><Menu size={18} /></button>
          <div className="flex-1 flex justify-end items-center gap-4">
            <Link to={`${basePath}/notifications`} className="p-2 text-slate-400 hover:text-slate-600 transition-all relative">
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>}
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
};
