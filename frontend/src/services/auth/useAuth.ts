import { useContext } from 'react';
import { AuthContext } from './AuthContextDef';
import type { AuthContextType } from './types';

/**
 * Hook to access the auth context
 */
export const useAuth = (): AuthContextType => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return authContext;
};
