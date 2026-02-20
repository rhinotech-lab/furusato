
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User as UserIcon, 
  Users, 
  Save, 
  Plus, 
  Settings as SettingsIcon,
  MoreVertical,
  X,
  AlertTriangle,
  Sparkles,
  Loader2,
  RefreshCw,
  ArrowRight,
  Database,
  Mail,
  Link as LinkIcon,
  UploadCloud,
  FileCheck,
  CalendarDays
} from 'lucide-react';
import { ADMIN_USERS, MUNICIPALITY_USERS } from '../services/mockDb';

type Tab = 'account' | 'team' | 'system';

export const AccountSettings: React.FC = () => {
  const { currentUser } = useAuth();
  
  const initialTab = currentUser?.role === 'creator' ? 'account' : (currentUser?.role === 'super_admin' ? 'team' : 'account');
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  if (!currentUser) return null;

  const tabs: { id: Tab; label: string; icon: any; roles: string[]; description: string }[] = [
    { id: 'account', label: 'アカウント', icon: UserIcon, roles: ['super_admin', 'creator', 'municipality_user', 'business_user'], description: '個人設定・通知' },
    { id: 'team', label: 'チーム管理', icon: Users, roles: ['super_admin', 'municipality_user'], description: '権限・メンバー招待' },
    { id: 'system', label: 'システム', icon: SettingsIcon, roles: ['super_admin'], description: '年度・自治体情報' },
  ];

  const visibleTabs = tabs.filter(t => t.roles.includes(currentUser.role));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      <div className="flex flex-col shrink-0">
        <h1 className="text-xl font-black text-slate-900 tracking-tighter">設定</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden pb-10">
        <div className="lg:w-72 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200/60 p-2 shadow-premium sticky top-0">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all mb-0.5 group ${
                  activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-white/10' : 'bg-slate-50 group-hover:bg-white'}`}>
                    <tab.icon size={14} />
                </div>
                <div>
                    <p className="text-[12px] font-bold tracking-tight leading-none mb-0.5">{tab.label}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-widest leading-none ${activeTab === tab.id ? 'text-white/40' : 'text-slate-300'}`}>{tab.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0 overflow-y-auto scrollbar-hide max-w-2xl">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-premium overflow-hidden">
            {activeTab === 'account' && <AccountSection />}
            {activeTab === 'team' && <TeamSection />}
            {activeTab === 'system' && <SystemSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountSection: React.FC = () => {
  const { currentUser, appSettings, updateSettings } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  const toggleEmailSetting = (key: 'emailNotifyOnUpload' | 'emailNotifyOnApprovalRequest' | 'emailIncludeDirectLinks') => {
    updateSettings({ [key]: !appSettings[key] });
  };

  const handleSave = () => {
    // 保存処理をシミュレート
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="divide-y divide-slate-100">
      <div className="p-6 space-y-8">
        <section className="space-y-4">
            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                <UserIcon size={16} className="text-accent" />
                プロフィール編集
            </h3>
            <div className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">表示名</label>
                  <input type="text" defaultValue={currentUser?.name} className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">メールアドレス</label>
                  <input type="email" defaultValue={currentUser?.email} className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none font-bold text-slate-700 text-sm focus:bg-white transition-all" />
                </div>
            </div>
        </section>

        {/* メール通知設定 */}
        <section className="space-y-4">
            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                <Mail size={16} className="text-accent" />
                メール通知設定
            </h3>
            <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl text-slate-400 group-hover:text-accent group-hover:bg-blue-50 transition-all">
                            <UploadCloud size={16} />
                        </div>
                        <div>
                            <p className="text-[12px] font-bold text-slate-900 mb-0.5">新規アップロード時に通知</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">New Upload Alert</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => toggleEmailSetting('emailNotifyOnUpload')}
                        className={`w-12 h-6 rounded-full p-1 transition-all flex items-center ${appSettings.emailNotifyOnUpload ? 'bg-accent justify-end shadow-lg shadow-accent/20' : 'bg-slate-200 justify-start'}`}
                    >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
                            <FileCheck size={16} />
                        </div>
                        <div>
                            <p className="text-[12px] font-bold text-slate-900 mb-0.5">承認依頼通知</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Approval Request</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => toggleEmailSetting('emailNotifyOnApprovalRequest')}
                        className={`w-12 h-6 rounded-full p-1 transition-all flex items-center ${appSettings.emailNotifyOnApprovalRequest ? 'bg-emerald-500 justify-end shadow-lg shadow-emerald-200' : 'bg-slate-200 justify-start'}`}
                    >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl text-white shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl text-accent">
                            <LinkIcon size={16} />
                        </div>
                        <div>
                            <p className="text-[12px] font-bold mb-0.5 italic">DLまたはログインリンクをメールに含める</p>
                            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Include Direct Links</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => toggleEmailSetting('emailIncludeDirectLinks')}
                        className={`w-12 h-6 rounded-full p-1 transition-all flex items-center ${appSettings.emailIncludeDirectLinks ? 'bg-accent justify-end' : 'bg-slate-700 justify-start'}`}
                    >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                </div>
            </div>
        </section>
      </div>

      <div className="p-6 flex justify-end bg-slate-50/50">
        {isSaved ? (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-[11px] shadow-lg animate-in zoom-in-95 duration-300">
            <FileCheck size={14} /> 保存しました
          </div>
        ) : (
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[11px] shadow-lg active:scale-95 flex items-center gap-1.5 group hover:bg-slate-800 transition-all"
          >
            <Save size={14} className="group-hover:scale-110 transition-transform" /> アカウント設定を保存
          </button>
        )}
      </div>
    </div>
  );
};

const TeamSection: React.FC = () => {
  const allUsers = [...ADMIN_USERS, ...MUNICIPALITY_USERS];
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">チーム・権限管理</h3>
            <p className="text-[11px] text-slate-400 font-bold">自治体職員や制作デザイナーの招待、役割（ロール）の付与を行います。</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-xl font-bold text-[11px] hover:bg-sky-700 transition-all shadow-lg active:scale-95">
            <Plus size={14} />
            新しいメンバーを招待
        </button>
      </div>

      <div className="bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm border-separate border-spacing-0">
          <thead>
            <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <th className="px-4 py-3 border-b border-slate-100">名前 / 連絡先</th>
              <th className="px-4 py-3 border-b border-slate-100">権限ロール</th>
              <th className="px-4 py-3 border-b border-slate-100">担当事業者</th>
              <th className="px-4 py-3 border-b border-slate-100"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {allUsers.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[11px]">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-[12px]">{user.name}</span>
                            <span className="text-[9px] text-slate-400 font-mono">{user.email}</span>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-3">
                    <select className="bg-slate-50 border-0 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-tight outline-none cursor-pointer focus:bg-white transition-all">
                        <option>承認権限あり (管理者)</option>
                        <option>編集のみ (デザイナー)</option>
                        <option>閲覧のみ (監査・役員)</option>
                    </select>
                </td>
                <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-bold border border-blue-100">全事業者</span>
                    </div>
                </td>
                <td className="px-4 py-3 text-right">
                    <button className="p-1.5 text-slate-200 hover:text-slate-900 transition-colors">
                        <MoreVertical size={14} />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


const SystemSection: React.FC = () => {
  const { currentFiscalYear, setFiscalYear } = useAuth();
  const [isSwitchingYear, setIsSwitchingYear] = useState<number | null>(null);
  const [switchProgress, setSwitchProgress] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const handleYearSwitch = async (targetYear: number) => {
    if (targetYear === currentFiscalYear) return;
    
    const confirmMessage = targetYear > currentFiscalYear 
      ? `${currentFiscalYear}年度のデータをアーカイブし、${targetYear}年度への切り替え処理を開始します。よろしいですか？`
      : `${targetYear}年度へ表示を切り替えます。過去年度のデータは閲覧専用となります。`;

    if (window.confirm(confirmMessage)) {
      setIsSwitchingYear(targetYear);
      setSwitchProgress(0);

      // アーカイブ処理のシミュレーション
      for (let i = 0; i <= 100; i += 20) {
          setSwitchProgress(i);
          await new Promise(r => setTimeout(r, 400));
      }

      setFiscalYear(targetYear);
      setIsSwitchingYear(null);
      setSwitchProgress(0);
    }
  };

  const years = [currentFiscalYear - 1, currentFiscalYear, currentFiscalYear + 1];

  return (
    <div className="divide-y divide-slate-100 relative">
      {/* 年度切り替えローディングオーバーレイ */}
      {isSwitchingYear !== null && (
          <div className="absolute inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300 rounded-2xl">
              <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="relative inline-block">
                    <Database size={40} className="text-accent animate-bounce mx-auto" />
                    <RefreshCw size={16} className="text-white absolute -bottom-1 -right-1 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white tracking-tighter">{isSwitchingYear}年度へ移行中...</h3>
                    <p className="text-[11px] text-slate-400 font-bold leading-relaxed">前年度データのアーカイブと、マスタ情報の同期を行っています。</p>
                  </div>
                  <div className="space-y-3">
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-accent transition-all duration-500 ease-out shadow-[0_0_15px_rgba(2,132,199,0.5)]" style={{ width: `${switchProgress}%` }}></div>
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{switchProgress}% COMPLETE</p>
                  </div>
              </div>
          </div>
      )}

      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
                <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                    <CalendarDays size={16} className="text-emerald-600" />
                    年度管理設定
                </h3>
                <p className="text-[11px] text-slate-400 font-bold">システムの稼働年度を制御します。切り替えにより過去データは自動的に保護されます。</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg ring-2 ring-slate-900/10 shrink-0">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-black uppercase tracking-widest">現在の運用：{currentFiscalYear}年度</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {years.map(year => {
                const isCurrent = year === currentFiscalYear;
                return (
                    <button 
                      key={year}
                      onClick={() => handleYearSwitch(year)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 group overflow-hidden ${
                          isCurrent 
                              ? 'border-accent bg-blue-50/50 shadow-md shadow-accent/5 ring-2 ring-accent/5' 
                              : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                      }`}
                    >
                        <div className={`mb-3 flex items-center justify-between`}>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${isCurrent ? 'bg-accent text-white' : 'bg-white text-slate-300'}`}>
                                <CalendarDays size={16} />
                            </div>
                            {isCurrent && <span className="px-2 py-0.5 bg-accent text-white rounded-md text-[8px] font-bold uppercase tracking-widest animate-in zoom-in duration-300">Active</span>}
                        </div>
                        <div className="text-left">
                            <p className={`text-[15px] font-black tracking-tighter ${isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>{year}年度</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                {year < currentFiscalYear ? 'アーカイブ済み' : isCurrent ? '運用中' : '準備可能'}
                            </p>
                        </div>
                        {!isCurrent && (
                            <div className="absolute bottom-4 right-6 flex items-center gap-1 text-[9px] font-black text-accent opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 uppercase tracking-widest">
                                切り替える <ArrowRight size={10} />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={14} />
            <div className="space-y-0.5">
                <p className="text-[12px] font-bold text-amber-900 tracking-tight">年度更新時の注意事項</p>
                <p className="text-[10px] text-amber-700/70 font-bold leading-relaxed">新年度への移行を行うと、前年度の全バナープロジェクトは「完了済み」として保護され、原則として編集ができなくなります。</p>
            </div>
        </div>
      </div>

      <div className="p-6 flex justify-end">
        {isSaved ? (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-[11px] shadow-lg animate-in zoom-in-95 duration-300">
            <FileCheck size={14} /> 保存しました
          </div>
        ) : (
          <button 
            onClick={() => {
              setIsSaved(true);
              setTimeout(() => {
                setIsSaved(false);
              }, 3000);
            }}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[11px] shadow-lg active:scale-95 hover:bg-slate-800 transition-all"
          >
            設定を保存
          </button>
        )}
      </div>
    </div>
  );
};
