
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

export type SendMode = 'enter' | 'ctrl_enter';

interface AppSettings {
  sendMode: SendMode;
  attentionDays: number;
  warningDays: number;
  excludeHolidays: boolean;
  checklist: string[];
  // メール通知設定の追加
  emailNotifyOnUpload: boolean;
  emailNotifyOnApprovalRequest: boolean;
  emailIncludeDirectLinks: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  appSettings: AppSettings;
  currentFiscalYear: number;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setFiscalYear: (year: number) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentFiscalYear, setCurrentFiscalYear] = useState<number>(2025);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    sendMode: 'enter',
    attentionDays: 5,
    warningDays: 2,
    excludeHolidays: true,
    emailNotifyOnUpload: true,
    emailNotifyOnApprovalRequest: true,
    emailIncludeDirectLinks: true,
    checklist: [
      '自治体の指定ロゴは正しく配置されていますか？',
      '寄付金額のフォント・視認性は確保されていますか？',
      'NGワード（最高、日本一等）が含まれていませんか？',
      'ファイル名は指定の規則に従っていますか？'
    ]
  });

  // 初期化時にユーザー情報を取得
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authApi.me();
        if (response.user) {
          setCurrentUser({
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            role: response.user.type === 'admin' ? 'super_admin' : 
                  response.user.type === 'municipality' ? 'municipality_user' : 'business_user',
            municipality_id: response.user.municipality_id ?? undefined,
            business_id: response.user.business_id ?? undefined,
          });
        }
      } catch (error) {
        // トークンが無効または未認証
        console.log('未認証状態');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (userId: string, password: string) => {
    try {
      // IDとパスワードで認証（開発用：本番ではAPIを使用）
      const { authenticateUser } = await import('../services/mockDb');
      const id = parseInt(userId);
      const user = authenticateUser(id, password);
      
      if (!user) {
        throw new Error('IDまたはパスワードが正しくありません');
      }

      // ユーザー情報を設定
      setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        municipality_id: user.municipality_id ?? undefined,
        business_id: user.business_id ?? undefined,
      });

      // トークンを設定（開発用：実際のAPIではトークンを受け取る）
      localStorage.setItem('auth_token', `mock_token_${user.id}`);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    } finally {
      setCurrentUser(null);
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setAppSettings(prev => ({ ...prev, ...newSettings }));
  };

  const setFiscalYear = (year: number) => {
    setCurrentFiscalYear(year);
  };

  return (
    <AuthContext.Provider value={{ currentUser, appSettings, currentFiscalYear, login, logout, updateSettings, setFiscalYear, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
