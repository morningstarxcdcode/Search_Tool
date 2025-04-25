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
  companyName?: string;
  phoneNumber?: string;
  subscription: {
    active: boolean;
    plan: string;
    expiresAt: string;
  };
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

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call to verify the token
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Check if token is still valid
          // For the demo we're just using the presence of the user in localStorage
          setUser(parsedUser);
        }
      } catch (err) {
        console.error('Error checking authentication', err);
        setError('Failed to authenticate');
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
      // Check for admin credentials
      // Only allow login with the specified admin credentials for the demo
      if (email !== 'admin@gmail.com' || password !== '123456') {
        throw new Error('Invalid credentials');
      }
      
      // This would be an API call in a real app
      // For the demo, we'll simulate a successful login
      const mockUser: User = {
        id: 'user123',
        email,
        name: 'Admin User',
        searchCount: 0,
        exportCount: 0,
        competitorAnalysisCount: 0,
        subscription: {
          active: true,
          plan: 'standard',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        },
      };
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error', err);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a demo app, we don't want to actually create new accounts
      // We'll just show a success message and redirect to login
      setTimeout(() => {
        setLoading(false);
        // Redirect to login page instead of actually creating an account
        router.push('/login');
      }, 1000);
    } catch (err) {
      console.error('Signup error', err);
      setError('アカウント作成に失敗しました。デモアカウントをご利用ください。');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove user from localStorage
    localStorage.removeItem('user');
    setUser(null);
    
    // Redirect to home
    router.push('/');
  };

  const checkSubscription = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // In a real app, this would be an API call
      // For the demo, we'll use the user's subscription status
      return user.subscription.active;
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
    
    const userPlan = user.subscription.plan;
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
    
    const userPlan = user.subscription.plan;
    return currentAnalysisCount < analysisLimits[userPlan];
  };

  // Check if user can export CSV
  const canExportCSV = async () => {
    if (!user) return false;
    
    const isSubscribed = await checkSubscription();
    if (!isSubscribed) return false;
    
    const userPlan = user.subscription.plan;
    
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
    
    const userPlan = user.subscription.plan;
    
    // Basic plan can't save search history
    if (userPlan === 'basic') return false;
    
    // Return retention period in days
    if (userPlan === 'standard') return 7;
    if (userPlan === 'premium') return Infinity;
    
    return false;
  };

  // Check if user can use custom tags
  const canUseCustomTags = async () => {
    if (!user) return false;
    
    const isSubscribed = await checkSubscription();
    if (!isSubscribed) return false;
    
    const userPlan = user.subscription.plan;
    
    // Only standard and premium can use custom tags
    return userPlan === 'standard' || userPlan === 'premium';
  };

  // Check if user can use AI search assistant
  const canUseAIAssistant = async () => {
    if (!user) return false;
    
    const isSubscribed = await checkSubscription();
    if (!isSubscribed) return false;
    
    const userPlan = user.subscription.plan;
    
    // Only premium users can use AI assistant
    return userPlan === 'premium';
  };

  // Check if user can access priority support
  const canAccessPrioritySupport = async () => {
    if (!user) return false;
    
    const isSubscribed = await checkSubscription();
    if (!isSubscribed) return false;
    
    const userPlan = user.subscription.plan;
    
    // Only premium users get priority support
    return userPlan === 'premium';
  };

  // Increment search count
  const incrementSearchCount = async () => {
    if (!user) return;
    
    const currentCount = user.searchCount || 0;
    const updatedUser = {
      ...user,
      searchCount: currentCount + 1
    };
    
    // Update user in localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    // In a real app, would update the count in the backend
  };

  // Increment competitor analysis count
  const incrementCompetitorAnalysisCount = async () => {
    if (!user) return;
    
    const currentCount = user.competitorAnalysisCount || 0;
    const updatedUser = {
      ...user,
      competitorAnalysisCount: currentCount + 1
    };
    
    // Update user in localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    // In a real app, would update the count in the backend
  };

  // Increment export count
  const incrementExportCount = async () => {
    if (!user) return;
    
    const currentCount = user.exportCount || 0;
    const updatedUser = {
      ...user,
      exportCount: currentCount + 1
    };
    
    // Update user in localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    // In a real app, would update the count in the backend
  };

  const value = {
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
    incrementExportCount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 