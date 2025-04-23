import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  logout: () => {},
  signup: async () => {},
  checkSubscription: async () => false,
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
      // This would be an API call in a real app
      // For the demo, we'll simulate a successful login
      const mockUser: User = {
        id: 'user123',
        email,
        name: 'Demo User',
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
      // This would be an API call in a real app
      // For the demo, we'll simulate a successful signup
      const mockUser: User = {
        id: 'user' + Date.now(),
        email,
        name,
        subscription: {
          active: false,
          plan: '',
          expiresAt: '',
        },
      };
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      // Redirect to subscription page
      router.push('/subscription');
    } catch (err) {
      console.error('Signup error', err);
      setError('Failed to create account');
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

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    signup,
    checkSubscription
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 