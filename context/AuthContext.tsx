
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { ADMIN_USERS, MUNICIPALITY_USERS, BUSINESS_USERS } from '../services/mockDb';

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
  login: (userId: number, type: 'admin' | 'municipality' | 'business') => void;
  logout: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setFiscalYear: (year: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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

  const login = (userId: number, type: 'admin' | 'municipality' | 'business') => {
    let user: User | undefined;
    if (type === 'admin') {
      user = ADMIN_USERS.find(u => u.id === userId);
    } else if (type === 'municipality') {
      user = MUNICIPALITY_USERS.find(u => u.id === userId);
    } else {
      user = BUSINESS_USERS.find(u => u.id === userId);
    }
    
    if (user) {
      setCurrentUser(user);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setAppSettings(prev => ({ ...prev, ...newSettings }));
  };

  const setFiscalYear = (year: number) => {
    setCurrentFiscalYear(year);
  };

  return (
    <AuthContext.Provider value={{ currentUser, appSettings, currentFiscalYear, login, logout, updateSettings, setFiscalYear }}>
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
