
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authenticateUser, MUNICIPALITIES, BUSINESSES } from '../services/mockDb';
import { 
  LogIn, 
  User as UserIcon, 
  Lock,
  AlertCircle
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const id = parseInt(userId);
      if (isNaN(id)) {
        setError('IDは数値で入力してください');
        setIsLoading(false);
        return;
      }

      const user = authenticateUser(id, password);
      if (!user) {
        setError('IDまたはパスワードが正しくありません');
        setIsLoading(false);
        return;
      }

      // 役割に応じてタイプを判定
      let type: 'admin' | 'municipality' | 'business' = 'admin';
      if (user.role === 'municipality_user') {
        type = 'municipality';
      } else if (user.role === 'business_user') {
        type = 'business';
      } else if (user.role === 'super_admin' || user.role === 'creator') {
        type = 'admin';
      }

      // ログイン情報を保存
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

      // 認証処理
      await login(userId, password);

      // 役割に応じてリダイレクト
      if (type === 'admin') {
        navigate('/admin');
      } else if (type === 'municipality') {
        navigate('/municipality');
      } else {
        navigate('/business');
      }
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
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
          <div className="flex-1 flex items-center">
            <div className="w-full max-w-md mx-auto md:mx-0">
              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-3 italic">ログイン</h2>
                <p className="text-[13px] text-slate-600 font-bold leading-relaxed">IDとパスワードを入力してください。</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                    <AlertCircle size={18} />
                    <span className="text-sm font-bold">{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <UserIcon size={14} />
                    ID
                  </label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="ユーザーIDを入力"
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold text-base placeholder-slate-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Lock size={14} />
                    パスワード
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="パスワードを入力"
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold text-base placeholder-slate-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-base hover:bg-black transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>ログイン中...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      <span>ログイン</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">テストアカウント</p>
                <div className="space-y-2 text-[10px] text-slate-600 font-bold">
                  <p>管理者: ID 1 / パスワード admin123</p>
                  <p>制作者: ID 2 / パスワード creator123</p>
                  <p>自治体: ID 3 / パスワード sapporo123</p>
                  <p>事業者: ID 101 / パスワード farm123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
