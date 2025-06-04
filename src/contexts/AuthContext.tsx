import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  ConfirmationResult
} from 'firebase/auth';
import { 
  subscribeToAuthChanges,
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  loginWithGoogle,
  loginWithFacebook,
  logoutUser,
  resetPassword,
  loginWithPhoneNumber,
  verifyPhoneCode,
  RecaptchaVerifier,
  updateUserPassword
} from '../services/firebase';
import { auth } from '../services/firebase';

// Define the shape of our context
interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  register: (email: string, password: string, displayName?: string) => Promise<{ user: User | null; error: string | null }>;
  logout: () => Promise<{ success: boolean; error: string | null }>;
  googleLogin: () => Promise<{ user: User | null; error: string | null }>;
  facebookLogin: () => Promise<{ user: User | null; error: string | null }>;
  resetUserPassword: (email: string) => Promise<{ success: boolean; error: string | null }>;
  updateCurrentUser: (user: User | null) => void;
  phoneLogin: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<{ confirmationResult: any; error: string | null }>;
  verifyPhoneCode: (confirmationResult: any, code: string) => Promise<{ user: User | null; error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error: string | null }>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthResult {
  user: User | null;
  error: string | null;
}

interface PhoneAuthResult {
  confirmationResult: ConfirmationResult | null;
  error: string | null;
}

interface VerifyPhoneResult {
  user: User | null;
  error: string | null;
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const updateCurrentUser = (user: User | null) => {
    setCurrentUser(user);
  };

  const login = async (email: string, password: string) => {
    return loginWithEmailAndPassword(email, password);
  };

  const register = async (email: string, password: string, displayName?: string) => {
    return registerWithEmailAndPassword(email, password, displayName);
  };

  const logout = async () => {
    return logoutUser();
  };

  const googleLogin = async () => {
    return loginWithGoogle();
  };

  const facebookLogin = async () => {
    return loginWithFacebook();
  };

  const resetUserPassword = async (email: string) => {
    return resetPassword(email);
  };

  const phoneLogin = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
    return loginWithPhoneNumber(phoneNumber, recaptchaVerifier);
  };

  const verifyPhoneCode = async (
    confirmationResult: ConfirmationResult,
    code: string
  ): Promise<VerifyPhoneResult> => {
    try {
      const result = await confirmationResult.confirm(code);
      return { user: result.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message || 'Failed to verify code' };
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!currentUser) {
      return { success: false, error: 'No user is currently logged in' };
    }
    return updateUserPassword(currentUser, newPassword);
  };

  const value = {
    currentUser,
    isLoading,
    login,
    register,
    logout,
    googleLogin,
    facebookLogin,
    resetUserPassword,
    updateCurrentUser,
    phoneLogin,
    verifyPhoneCode,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 