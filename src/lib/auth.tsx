import { createContext, useContext, useEffect, useState } from 'react';
import { User, UserUpdateData } from './types';
import { api } from './api-client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: UserUpdateData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        // Try to make an authenticated request to verify session
        await api.emailAccounts.list({ limit: 1 });
        
        // If successful, get user data from localStorage or set defaults
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Create default user if authenticated but no local data
          const defaultUser: User = {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'Admin',
            preferences: {
              theme: 'light',
              emailNotifications: true,
              defaultEmailAccount: '',
              defaultReplyTemplate: ''
            }
          };
          setUser(defaultUser);
          localStorage.setItem('user', JSON.stringify(defaultUser));
        }
      } catch (error) {
        // If request fails, user is not authenticated
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Make the actual API call
      await api.auth.login({ username, password });
      
      // After successful login, create the user object
      const loggedInUser: User = {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'Admin',
        preferences: {
          theme: 'light',
          emailNotifications: true,
          defaultEmailAccount: '',
          defaultReplyTemplate: ''
        }
      };
      
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
      setUser(null);
      localStorage.removeItem('user');
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Logout failed. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: UserUpdateData) => {
    setIsLoading(true);
    try {
      // In a real app, this would call an API endpoint
      if (user) {
        const updatedUser = {
          ...user,
          ...data,
          preferences: {
            ...user.preferences,
            ...data.preferences
          }
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}