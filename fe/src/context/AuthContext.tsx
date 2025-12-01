import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/auth';
import { useNotificationStore } from '../stores/useNotificationStore';
import type { Token } from '../types/auth';

type AuthContextType = {
  token: Token;
  username: string | null;
  setUsername: (username: string | null) => void;
  setToken: (t: Token) => void;
  isAuthenticated: boolean;
  logout: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<Token>(null);
  const [username, setUsername] = useState<string | null>(null);
  const { show } = useNotificationStore();
  const [loading, setLoading] = useState(true);

  function logout() {
    setToken(null);
    setUsername(null);
  }

  useEffect(() => {
    const refreshSession = async () => {
      try {
        const res = await new AuthService(token).refreshToken();
        setToken(res.access_token);
        setUsername(res.username);
      } catch (err) {
        show('Not authenticated', 'error');
        logout();
      } finally {
        setLoading(false);
      }
    };

    refreshSession();
  }, []);

  const value: AuthContextType = {
    token,
    username,
    setUsername,
    setToken,
    isAuthenticated: !!token,
    logout,
    loading,
    setLoading,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
