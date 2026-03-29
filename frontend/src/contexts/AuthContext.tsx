'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, UserRole } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{success: boolean; role?: string}>;
  loginWithCode: (authCode: string) => Promise<{success: boolean; teacher?: string}>;
  register: (username: string, password: string, email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isTeacher: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('authUser');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('authUser', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('authUser');
    }
  }, [user]);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) return { success: false };
      const data = await res.json();
      if (!data.success) return { success: false };
      
      setUser({
        uid: data.username,
        username: data.username,
        role: data.role as UserRole,
        authCode: data.authCode
      });
      return { success: true, role: data.role };
    } catch {
      return { success: false };
    }
  };

  const loginWithCode = async (authCode: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authCode }),
      });
      if (!res.ok) return { success: false };
      const data = await res.json();
      if (!data.success) return { success: false };

      // We use a temporary UID for the student or let the GameContext assign one.
      const tempId = `stu_${Math.random().toString(36).substring(2, 9)}`;
      
      setUser({
        uid: tempId,
        username: '학생', 
        role: 'student' as UserRole,
        teacherId: data.teacher,
        authCode: data.authCode
      });
      return { success: true, teacher: data.teacher };
    } catch {
      return { success: false };
    }
  };

  const register = async (username: string, password: string, email: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.detail || '회원가입 실패' };
      return { success: true, message: data.authCode || '가입 완료' };
    } catch {
      return { success: false, message: '서버 연결 오류' };
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('authUser');
    sessionStorage.removeItem('adminToken');
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, loginWithCode, register, logout,
      isTeacher: user?.role === 'teacher',
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
