
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ADMIN_USERS, MUNICIPALITY_USERS, MUNICIPALITIES, BUSINESSES, BUSINESS_USERS } from '../services/mockDb';
import { 
  MapPin, 
  ChevronRight, 
  ArrowLeft, 
  User as UserIcon, 
  Building2, 
  ShieldCheck, 
  RefreshCw, 
  LogIn, 
  Palette, 
  Snowflake, 
  Landmark, 
  Mountain, 
  Waves, 
  Sun,
  Map as MapIcon,
  Apple,
  Fish,
  Wind,
  Trees,
  Flower2,
  UtensilsCrossed,
  Ship,
  Palmtree,
  Cloud,
  X,
  Store,
  Zap
} from 'lucide-react';

type LoginStep = 'region' | 'prefecture' | 'municipality' | 'business' | 'user' | 'remembered';

const REGIONS = [
  { 
    id: 'hokkaido_tohoku', 
    name: '北海道・東北', 
    icon: Snowflake, 
    color: 'text-sky-700', 
    mesh: 'from-sky-500/50 via-indigo-300/20 to-emerald-300/30',
    border: 'border-sky-300/40',
    prefs: [
      { name: '北海道', icon: Snowflake },
      { name: '青森県', icon: Apple },
      { name: '岩手県', icon: Mountain },
      { name: '宮城県', icon: Fish },
      { name: '秋田県', icon: Wind },
      { name: '山形県', icon: Apple },
      { name: '福島県', icon: Trees },
    ]
  },
  { 
    id: 'kanto', 
    name: '関東', 
    icon: Landmark, 
    color: 'text-indigo-700', 
    mesh: 'from-indigo-600/50 via-fuchsia-300/20 to-blue-300/30',
    border: 'border-indigo-300/40',
    prefs: [
      { name: '茨城県', icon: Flower2 },
      { name: '栃木県', icon: Sun },
      { name: '群馬県', icon: Mountain },
      { name: '埼玉県', icon: Trees },
      { name: '千葉県', icon: Ship },
      { name: '東京都', icon: Landmark },
      { name: '神奈川県', icon: Ship },
    ]
  },
  { 
    id: 'chubu', 
    name: '中部', 
    icon: Mountain, 
    color: 'text-emerald-700', 
    mesh: 'from-emerald-600/50 via-lime-300/20 to-teal-300/30',
    border: 'border-emerald-300/40',
    prefs: [
        { name: '新潟県', icon: Wind }, { name: '富山県', icon: Waves }, { name: '石川県', icon: Landmark },
        { name: '福井県', icon: Fish }, { name: '山梨県', icon: Mountain }, { name: '長野県', icon: Trees },
        { name: '岐阜県', icon: Mountain }, { name: '静岡県', icon: Sun }, { name: '愛知県', icon: Landmark }
    ]
  },
  { 
    id: 'kansai', 
    name: '関西', 
    icon: Landmark, 
    color: 'text-purple-700', 
    mesh: 'from-purple-600/50 via-pink-300/20 to-indigo-300/30',
    border: 'border-purple-300/40',
    prefs: [
        { name: '三重県', icon: Ship }, { name: '滋賀県', icon: Waves }, { name: '京都府', icon: Landmark },
        { name: '大阪府', icon: Landmark }, { name: '兵庫県', icon: Ship }, { name: '奈良県', icon: Trees }, { name: '和歌山県', icon: Sun }
    ]
  },
  { 
    id: 'chugoku_shikoku', 
    name: '中国・四国', 
    icon: Waves, 
    color: 'text-orange-700', 
    mesh: 'from-orange-600/50 via-yellow-300/20 to-red-300/30',
    border: 'border-orange-300/40',
    prefs: [
        { name: '鳥取県', icon: Wind }, { name: '島根県', icon: Cloud }, { name: '岡山県', icon: Apple },
        { name: '広島県', icon: Landmark }, { name: '山口県', icon: Ship }, { name: '徳島県', icon: Waves },
        { name: '香川県', icon: UtensilsCrossed }, { name: '愛媛県', icon: Apple }, { name: '高知県', icon: Sun }
    ]
  },
  { 
    id: 'kyushu_okinawa', 
    name: '九州・沖縄', 
    icon: Sun, 
    color: 'text-rose-700', 
    mesh: 'from-rose-600/50 via-amber-300/20 to-orange-300/30',
    border: 'border-rose-300/40',
    prefs: [
        { name: '福岡県', icon: Fish }, { name: '佐賀県', icon: Flower2 }, { name: '長崎県', icon: Ship },
        { name: '熊本県', icon: Mountain }, { name: '大分県', icon: Cloud }, { name: '宮崎県', icon: Sun },
        { name: '鹿児島県', icon: Mountain }, { name: '沖縄県', icon: Palmtree }
    ]
  },
];

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginTarget, setLoginTarget] = useState<'municipality' | 'business'>('municipality');
  const [step, setStep] = useState<LoginStep>('region');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedPref, setSelectedPref] = useState<string | null>(null);
  const [selectedMuniId, setSelectedMuniId] = useState<number | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [rememberedUser, setRememberedUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('furusato_last_login');
    if (saved) {
      setRememberedUser(JSON.parse(saved));
      setStep('remembered');
    }
  }, []);

  const handleLogin = (user: any, type: 'admin' | 'municipality' | 'business') => {
    const loginInfo = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        type: type,
        municipality_id: user.municipality_id,
        business_id: user.business_id,
        municipality_name: user.municipality_id ? MUNICIPALITIES.find(m => m.id === user.municipality_id)?.name : null,
        business_name: user.business_id ? BUSINESSES.find(b => b.id === user.business_id)?.name : null
    };
    localStorage.setItem('furusato_last_login', JSON.stringify(loginInfo));
    
    login(user.id, type);
    if (type === 'admin') navigate('/admin');
    else if (type === 'municipality') navigate('/municipality');
    else navigate('/business');
  };

  const resetSelection = () => {
    setStep('region');
    setSelectedRegion(null);
    setSelectedPref(null);
    setSelectedMuniId(null);
    setSelectedBusinessId(null);
  };

  const getFilteredMunticipalities = () => {
    if (!selectedPref) return [];
    if (selectedPref === '北海道') return MUNICIPALITIES.filter(m => m.id === 1);
    if (selectedPref === '福岡県') return MUNICIPALITIES.filter(m => m.id === 3);
    return [];
  };

  const renderStep = () => {
    switch (step) {
      case 'remembered':
        return (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-slate-900 text-white rounded-[2.2rem] flex items-center justify-center mx-auto mb-4 shadow-2xl transition-transform hover:scale-105">
                    {rememberedUser.type === 'municipality' ? <Building2 size={32} /> : rememberedUser.type === 'business' ? <Store size={32} /> : <ShieldCheck size={32} />}
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tighter">{rememberedUser.name} さん、おかえりなさい</h3>
                <p className="text-[13px] text-slate-600 font-bold">
                    {rememberedUser.business_name || rememberedUser.municipality_name || '管理者'} としてログイン
                </p>
            </div>
            <div className="space-y-3">
                <button
                    onClick={() => handleLogin(rememberedUser, rememberedUser.type)}
                    className="w-full flex items-center justify-between p-5 bg-slate-900 text-white rounded-[2.2rem] hover:bg-black transition-all shadow-xl group active:scale-[0.98]"
                >
                    <div className="flex flex-col items-start px-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-0.5">クイックログイン</span>
                        <span className="text-base font-black">管理画面へ入室</span>
                    </div>
                    <LogIn size={20} className="mr-3 group-hover:translate-x-2 transition-transform" />
                </button>
                <button onClick={resetSelection} className="w-full py-2 text-slate-500 hover:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all">
                    <RefreshCw size={12} /> アカウントを切り替える
                </button>
            </div>
          </div>
        );

      case 'region':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-4">
              <button onClick={() => setLoginTarget('municipality')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${loginTarget === 'municipality' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>自治体ログイン</button>
              <button onClick={() => setLoginTarget('business')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${loginTarget === 'business' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>事業者ログイン</button>
            </div>
            <div className="flex items-center gap-3 px-1">
                <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">地方を選択</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {REGIONS.map(r => (
                    <button
                        key={r.id}
                        onClick={() => { setSelectedRegion(r.id); setStep('prefecture'); }}
                        className={`p-5 bg-white border ${r.border} rounded-[1.8rem] shadow-sm transition-all text-left group flex items-center gap-4 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] relative overflow-hidden`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${r.mesh} opacity-50 group-hover:opacity-100 transition-all duration-700`} />
                        <div className={`w-10 h-10 rounded-[1rem] bg-white shadow-lg border border-slate-200 flex items-center justify-center ${r.color} group-hover:scale-110 transition-transform relative z-10 shrink-0`}>
                            <r.icon size={18} />
                        </div>
                        <span className="relative z-10 block font-black text-slate-900 text-[13px] tracking-tight truncate">{r.name}</span>
                    </button>
                ))}
            </div>
          </div>
        );

      case 'prefecture':
        const region = REGIONS.find(r => r.id === selectedRegion);
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-1">
                <button onClick={() => setStep('region')} className="flex items-center text-slate-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] gap-2 transition-all">
                    <ArrowLeft size={12} /> 戻る
                </button>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">都道府県を選択</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {region?.prefs.map(p => {
                    const hasData = p.name === '北海道' || p.name === '福岡県';
                    return (
                        <button
                            key={p.name}
                            disabled={!hasData}
                            onClick={() => { setSelectedPref(p.name); setStep('municipality'); }}
                            className={`p-4 rounded-2xl text-[11px] font-black transition-all border flex flex-col items-center gap-2 group/pref ${
                                hasData ? `bg-white border-slate-200 text-slate-900 hover:border-accent hover:shadow-premium` : 'bg-slate-300/30 border-transparent text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            <p.icon size={16} className={hasData ? 'text-accent opacity-80 group-hover/pref:scale-110 transition-transform' : 'opacity-20'} />
                            <span>{p.name}</span>
                        </button>
                    );
                })}
            </div>
          </div>
        );

      case 'municipality':
        const munis = getFilteredMunticipalities();
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-1">
                <button onClick={() => setStep('prefecture')} className="flex items-center text-slate-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] gap-2 transition-all">
                    <ArrowLeft size={12} /> 戻る
                </button>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">自治体を選択</h3>
            </div>
            <div className="space-y-3">
                {munis.map(m => (
                    <button
                        key={m.id}
                        onClick={() => { setSelectedMuniId(m.id); if (loginTarget === 'business') setStep('business'); else setStep('user'); }}
                        className="w-full flex items-center justify-between p-5 bg-white border border-slate-200 rounded-[1.8rem] hover:border-accent hover:shadow-premium transition-all group"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                                <Building2 size={20} />
                            </div>
                            <span className="block font-black text-slate-900 text-base leading-none tracking-tighter">{m.name}</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-accent transition-all" />
                    </button>
                ))}
            </div>
          </div>
        );

      case 'business':
        const bizList = BUSINESSES.filter(b => b.municipality_id === selectedMuniId);
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-1">
                <button onClick={() => setStep('municipality')} className="flex items-center text-slate-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] gap-2 transition-all">
                    <ArrowLeft size={12} /> 戻る
                </button>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">事業者を選択</h3>
            </div>
            <div className="space-y-3">
                {bizList.map(b => (
                    <button
                        key={b.id}
                        onClick={() => { setSelectedBusinessId(b.id); setStep('user'); }}
                        className="w-full flex items-center justify-between p-5 bg-white border border-slate-200 rounded-[1.8rem] hover:border-accent hover:shadow-premium transition-all group"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                                <Store size={20} />
                            </div>
                            <span className="block font-black text-slate-900 text-base leading-none tracking-tighter">{b.name}</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-accent transition-all" />
                    </button>
                ))}
            </div>
          </div>
        );

      case 'user':
        const users = loginTarget === 'municipality' 
            ? MUNICIPALITY_USERS.filter(u => u.municipality_id === selectedMuniId)
            : BUSINESS_USERS.filter(u => u.business_id === selectedBusinessId);
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-1">
                <button onClick={() => setStep(loginTarget === 'business' ? 'business' : 'municipality')} className="flex items-center text-slate-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] gap-2 transition-all">
                    <ArrowLeft size={12} /> 戻る
                </button>
                <h3 className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">ログインアカウント</h3>
            </div>
            <div className="grid gap-3">
                {users.map(u => (
                    <button
                        key={u.id}
                        onClick={() => handleLogin(u, loginTarget)}
                        className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[1.8rem] hover:border-accent hover:bg-slate-100 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md">
                                <UserIcon size={18} />
                            </div>
                            <div className="text-left">
                                <span className="block font-black text-slate-900 text-sm tracking-tight">{u.name}</span>
                                <span className="text-[9px] text-slate-500 font-bold opacity-60 uppercase">{u.email}</span>
                            </div>
                        </div>
                        <LogIn size={18} className="text-slate-300 group-hover:text-accent transition-all" />
                    </button>
                ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-[#E8EDF4] to-blue-200/50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[1000px] flex flex-col md:flex-row bg-[#F0F4F8] rounded-[3rem] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.2)] overflow-hidden border border-white/40 transition-all duration-700">
        <div className="md:w-[38%] bg-[#050505] p-10 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-accent/20 rounded-full blur-[100px] opacity-40"></div>
          <div className="relative z-10 space-y-12">
            <div className="flex flex-col animate-in slide-in-from-bottom-4 duration-700">
                <span className="text-accent text-[8px] font-black tracking-[0.4em] mb-5 uppercase opacity-70">Local Creative Connect</span>
                <div className="space-y-1">
                    <h1 className="text-4xl lg:text-5xl font-black leading-none tracking-tighter italic">ふるさと納税</h1>
                    <h2 className="text-3xl lg:text-4xl font-black leading-none tracking-tighter opacity-80">制作管理システム</h2>
                </div>
                <div className="w-10 h-[1.5px] bg-accent mt-8 rounded-full opacity-40"></div>
            </div>
          </div>
          <div className="relative z-10 pt-4 border-t border-white/5 opacity-20">
             <p className="text-[8px] font-black uppercase tracking-[0.3em]">© 2025 Local Creative MGT.</p>
          </div>
        </div>
        
        <div className="md:w-[62%] p-10 lg:p-14 bg-gradient-to-b from-[#F9FBFE] to-[#DEE5F0] flex flex-col border-l border-white/30">
          <div className="flex-1">
            <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-3 italic">{step === 'remembered' ? 'おかえりなさい' : 'はじめに'}</h2>
                <p className="text-[13px] text-slate-600 font-bold leading-relaxed">アカウントを選択してログインしてください。</p>
            </div>
            <div className="max-w-md mx-auto md:mx-0">
                {renderStep()}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-300">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                    <div className="w-3 h-[1.5px] bg-slate-400"></div> システム管理者アクセス
                </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {ADMIN_USERS.map(user => {
                  const isAdmin = user.role === 'super_admin';
                  const bgClass = isAdmin ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-100';
                  return (
                    <button key={user.id} onClick={() => handleLogin(user, 'admin')} className={`flex items-center gap-4 p-4 ${bgClass} rounded-[1.5rem] transition-all duration-300 group relative border hover:scale-[1.02] active:scale-[0.98] shadow-sm`}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-50 shadow-inner">
                            {isAdmin ? <ShieldCheck size={16} className="text-indigo-500" /> : <Palette size={16} className="text-accent" />}
                        </div>
                        <div className="text-left min-w-0">
                            <span className="block font-bold text-[12px] truncate text-slate-900">{user.name}</span>
                            <span className="block text-[8px] font-black uppercase tracking-widest mt-0.5 text-slate-400">{isAdmin ? '管理者' : '制作者'}</span>
                        </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
