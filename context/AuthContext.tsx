import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '../types';
import { AuthService } from '../services/authService';

interface AuthContextType {
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const verified = await AuthService.verifySession();

      if (!active) return;
      setSession(verified);
      setIsLoading(false);
    };

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await AuthService.login(email, pass);
    if (res.success && res.session) {
      setSession(res.session);
    }
    return { success: res.success, message: res.message };
  };

  const logout = () => {
    AuthService.logout();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
