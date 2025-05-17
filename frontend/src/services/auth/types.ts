import type { LoginCredentials, AuthState } from '../sync/types';

/**
 * Auth context type
 */
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
}