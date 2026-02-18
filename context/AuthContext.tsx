
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Role } from '../types';
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

// APIの type を フロントエンドの role にマッピング
const mapTypeToRole = (type: string): Role => {
  switch (type) {
    case 'municipality': return 'municipality_user';
    case 'business': return 'business_user';
    case 'admin':
    default: return 'super_admin';
  }
};

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

  // 初期化時にトークンがあればAPIでユーザー情報を取得
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // リアルAPIでセッション復元
          const response = await authApi.me();
          const apiUser = response.user;
          setCurrentUser({
            id: apiUser.id,
            name: apiUser.name,
            email: apiUser.email,
            role: mapTypeToRole(apiUser.type),
            municipality_id: apiUser.municipality_id ?? undefined,
            business_id: apiUser.business_id ?? undefined,
          });
        }
      } catch (error) {
        // トークンが無効な場合はクリア
        console.log('未認証状態（トークン無効）');
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // リアルAPIでログイン
      const response = await authApi.login(email, password);
      const apiUser = response.user;

      // ユーザー情報を設定
      setCurrentUser({
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: mapTypeToRole(apiUser.type),
        municipality_id: apiUser.municipality_id ?? undefined,
        business_id: apiUser.business_id ?? undefined,
      });

      // ログイン情報をlocalStorageに保存（表示用）
      localStorage.setItem('furusato_last_login', JSON.stringify({
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        type: apiUser.type,
        role: mapTypeToRole(apiUser.type),
      }));
    } catch (error) {
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ログアウトAPIが失敗してもローカルはクリア
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('furusato_last_login');
    setCurrentUser(null);
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
