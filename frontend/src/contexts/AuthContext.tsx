import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  searchCount?: number;
  exportCount?: number;
  competitorAnalysisCount?: number;
  phoneNumber?: string;
  plan?: string;
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
  checkSubscription: () => Promise<boolean>;
  canPerformRankingSearch: () => Promise<boolean>;
  canViewCompetitorAnalysis: () => Promise<boolean>;
  canExportCSV: () => Promise<boolean>;
  canSaveSearchHistory: () => Promise<number | false>;
  canUseCustomTags: () => Promise<boolean>;
  canUseAIAssistant: () => Promise<boolean>;
  canAccessPrioritySupport: () => Promise<boolean>;
  incrementSearchCount: () => Promise<void>;
  incrementCompetitorAnalysisCount: () => Promise<void>;
  incrementExportCount: () => Promise<void>;
  updateUserPlan: (plan: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  logout: () => {},
  signup: async () => {},
  checkSubscription: async () => false,
  canPerformRankingSearch: async () => false,
  canViewCompetitorAnalysis: async () => false,
  canExportCSV: async () => false,
  canSaveSearchHistory: async () => false,
  canUseCustomTags: async () => false,
  canUseAIAssistant: async () => false,
  canAccessPrioritySupport: async () => false,
  incrementSearchCount: async () => {},
  incrementCompetitorAnalysisCount: async () => {},
  incrementExportCount: async () => {},
  updateUserPlan: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Configure axios defaults
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/';

  // Add request interceptor to add auth token
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('api/v1/auth/me');
          setUser(response.data);
        }
      } catch (err) {
        console.error('Error checking authentication', err);
        setError('Failed to authenticate');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('api/v1/auth/token', 
        new URLSearchParams({
          username: email,
          password: password
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const { access_token, token_type } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('token_type', token_type);

      // Get user data
      const userResponse = await axios.get('api/v1/auth/me');
      setUser(userResponse.data);
    } catch (err) {
      console.error('Login error', err);
      throw new Error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.post('api/v1/auth/register', {
        email,
        name,
        password,
        role: 'user'
      });
    } catch (err) {
      console.error('Signup error', err);
      throw new Error('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
    setUser(null);
    router.push('/');
  };

  const checkSubscription = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await axios.get('/api/v1/auth/me');
      return !!response.data.plan;
    } catch (err) {
      console.error('Error checking subscription', err);
      return false;
    }
  };

  // Check if user can perform a ranking search
  const canPerformRankingSearch = async () => {
    if (!user) return false;
    
    const isSubscribed = await checkSubscription();
    if (!isSubscribed) return false;
    
    // Get current search count from user data
    const currentSearchCount = user.searchCount || 0;
    
    // Define limits based on plan
    const searchLimits: Record<string, number> = {
      'basic': 3,
      'standard': 50,
      'premium': Infinity
    };
    
    const userPlan = user.plan || 'basic';
    return currentSearchCount < searchLimits[userPlan];
  };

  // Check if user can view competitor analysis
  const canViewCompetitorAnalysis = async () => {
    if (!user) return false;
    
    const isSubscribed = await checkSubscription();
    if (!isSubscribed) return false;
    
    // Get current competitor analysis count from user data
    const currentAnalysisCount = user.competitorAnalysisCount || 0;
    
    // Define limits based on plan
    const analysisLimits: Record<string, number> = {
      'basic': 3,
      'standard': 50,
      'premium': Infinity
    };
    
    const userPlan = user.plan || 'basic';
    return currentAnalysisCount < analysisLimits[userPlan];
  };

  // Check if user can export CSV
  const canExportCSV = async () => {
    if (!user) return false;
    
    const isSubscribed = await checkSubscription();
    if (!isSubscribed) return false;
    
    const userPlan = user.plan || 'basic';
    
    // Basic plan can't export CSV
    if (userPlan === 'basic') return false;
    
    // Get current export count from user data
    const currentExportCount = user.exportCount || 0;
    
    // Define limits based on plan
    const exportLimits: Record<string, number> = {
      'standard': 5,
      'premium': Infinity
    };
    
    return currentExportCount < exportLimits[userPlan];
  };

  // Check if user can save search history and return retention period
  const canSaveSearchHistory = async () => {
    if (!user) return false;
    
    const isSubscribed = await checkSubscription();
    if (!isSubscribed) return false;
    
    const userPlan = user.plan || 'basic';
    
    // Basic plan can't save search history
    if (userPlan === 'basic') return false;
    
    // Return retention period in days
    if (userPlan === 'standard') return 7;
    if (userPlan === 'premium') return Infinity;
    
    return false;
  };

  const canUseCustomTags = async () => {
    if (!user) return false;
    
    const isSubscribed = await checkSubscription();
    if (!isSubscribed) return false;
    
    const userPlan = user.plan || 'basic';
    return userPlan === 'premium';
  };

  const canUseAIAssistant = async () => {
    if (!user) return false;
    
    const isSubscribed = await checkSubscription();
    if (!isSubscribed) return false;
    
    const userPlan = user.plan || 'basic';
    return userPlan === 'premium';
  };

  const canAccessPrioritySupport = async () => {
    if (!user) return false;
    
    const isSubscribed = await checkSubscription();
    if (!isSubscribed) return false;
    
    const userPlan = user.plan || 'basic';
    return userPlan === 'premium';
  };

  const incrementSearchCount = async () => {
    if (!user) return;
    
    try {
      await axios.post('/api/v1/user/increment-search-count');
      setUser(prev => prev ? { ...prev, searchCount: (prev.searchCount || 0) + 1 } : null);
    } catch (err) {
      console.error('Error incrementing search count', err);
    }
  };

  const incrementCompetitorAnalysisCount = async () => {
    if (!user) return;
    
    try {
      await axios.post('/api/v1/user/increment-analysis-count');
      setUser(prev => prev ? { ...prev, competitorAnalysisCount: (prev.competitorAnalysisCount || 0) + 1 } : null);
    } catch (err) {
      console.error('Error incrementing competitor analysis count', err);
    }
  };

  const incrementExportCount = async () => {
    if (!user) return;
    
    try {
      await axios.post('/api/v1/user/increment-export-count');
      setUser(prev => prev ? { ...prev, exportCount: (prev.exportCount || 0) + 1 } : null);
    } catch (err) {
      console.error('Error incrementing export count', err);
    }
  };

  const updateUserPlan = async (plan: string) => {
    if (!user) return;
    
    try {
      await axios.post('/api/v1/user/update-plan', { plan });
      setUser(prev => prev ? { ...prev, plan } : null);
    } catch (err) {
      console.error('Error updating user plan', err);
      throw new Error('Failed to update plan');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      signup,
      checkSubscription,
      canPerformRankingSearch,
      canViewCompetitorAnalysis,
      canExportCSV,
      canSaveSearchHistory,
      canUseCustomTags,
      canUseAIAssistant,
      canAccessPrioritySupport,
      incrementSearchCount,
      incrementCompetitorAnalysisCount,
      incrementExportCount,
      updateUserPlan,
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 