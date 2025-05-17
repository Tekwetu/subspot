import { 
  useState, 
  useEffect
} from 'react';
import type { ReactNode } from 'react';
import type { LoginResponse, AuthState, LoginCredentials } from '../sync/types';
import type { AuthContextType } from './types';
import { AuthContext } from './AuthContextDef';

// Token storage keys
const TOKEN_STORAGE_KEY = 'subscription_manager_token';
const USER_STORAGE_KEY = 'subscription_manager_user';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // State to track authentication status
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
  });

  // Load auth data from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const userJson = localStorage.getItem(USER_STORAGE_KEY);
      
      if (token && userJson) {
        const user = JSON.parse(userJson);
        setAuthState({
          isAuthenticated: true,
          token,
          user,
        });
      }
    } catch (error) {
      console.error('Error loading auth data from localStorage', error);
      // Clear any potentially corrupted data
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: LoginResponse = await response.json();
      
      // Save to state
      setAuthState({
        isAuthenticated: true,
        token: data.access_token,
        user: data.user,
      });

      // Save to localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    // Clear state
    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null,
    });

    // Clear localStorage
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  // Create context value
  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}