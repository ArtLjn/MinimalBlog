import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AuthState } from '@/types';
import { GitHubService, initGitHubService, clearGitHubService } from '@/services/github';

interface AuthContextType extends AuthState {
  login: (token: string, owner: string, repo: string, path: string) => Promise<boolean>;
  logout: () => void;
  githubService: GitHubService | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'blog_github_config';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
    loading: false,
    error: null,
  });
  const [service, setService] = useState<GitHubService | null>(null);

  // 初始化时检查 localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const config = JSON.parse(stored);
        handleLogin(config.token, config.owner, config.repo, config.path);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = useCallback(async (
    token: string, 
    owner: string, 
    repo: string, 
    path: string
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const githubService = initGitHubService({ token, owner, repo, path });
      const result = await githubService.authenticate();

      if (result.success && result.user) {
        setState({
          isAuthenticated: true,
          token,
          user: result.user,
          loading: false,
          error: null,
        });
        setService(githubService);
        
        // 保存到 localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, owner, repo, path }));
        return true;
      } else {
        setState({
          isAuthenticated: false,
          token: null,
          user: null,
          loading: false,
          error: result.error || 'Authentication failed',
        });
        clearGitHubService();
        return false;
      }
    } catch (error: any) {
      setState({
        isAuthenticated: false,
        token: null,
        user: null,
        loading: false,
        error: error.message || 'Authentication failed',
      });
      clearGitHubService();
      return false;
    }
  }, []);

  const handleLogin = async (token: string, owner: string, repo: string, path: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const githubService = initGitHubService({ token, owner, repo, path });
      const result = await githubService.authenticate();

      if (result.success && result.user) {
        setState({
          isAuthenticated: true,
          token,
          user: result.user,
          loading: false,
          error: null,
        });
        setService(githubService);
      } else {
        setState({
          isAuthenticated: false,
          token: null,
          user: null,
          loading: false,
          error: result.error || 'Authentication failed',
        });
        clearGitHubService();
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error: any) {
      setState({
        isAuthenticated: false,
        token: null,
        user: null,
        loading: false,
        error: error.message || 'Authentication failed',
      });
      clearGitHubService();
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const logout = useCallback(() => {
    setState({
      isAuthenticated: false,
      token: null,
      user: null,
      loading: false,
      error: null,
    });
    setService(null);
    clearGitHubService();
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        githubService: service,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
