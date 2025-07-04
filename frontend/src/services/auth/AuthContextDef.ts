import { createContext } from 'react';
import type { AuthContextType } from './types';

// Create the auth context
export const AuthContext = createContext<AuthContextType | null>(null);
