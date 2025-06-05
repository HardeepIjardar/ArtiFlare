import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
  User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  updatePassword,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyD0iSHDuOcPrm-yEaNm9zFxGma1gJENa2k",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "artiflare-001-35be5.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "artiflare-001-35be5",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "artiflare-001-35be5.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "115283598563",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:115283598563:web:ffda51f61ebf8088e279d6",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-2V6V0S1P77"
};

// Initialize Firebase and services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Set persistence to local
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

// Authentication providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Authentication functions
const registerWithEmailAndPassword = async (
  email: string, 
  password: string,
  displayName?: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (displayName && user) {
      await updateProfile(user, { displayName });
    }
    
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

const loginWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

const loginWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

const loginWithFacebook = async () => {
  try {
    const userCredential = await signInWithPopup(auth, facebookProvider);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const loginWithPhoneNumber = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
  try {
    if (!phoneNumber || !recaptchaVerifier) {
      throw new Error('Phone number and reCAPTCHA verifier are required');
    }

    // Validate phone number format
    if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }

    // Ensure reCAPTCHA is rendered
    try {
      await recaptchaVerifier.render();
    } catch (renderError) {
      console.error('reCAPTCHA render error:', renderError);
      throw new Error('Failed to initialize reCAPTCHA');
    }

    // Get the reCAPTCHA token
    try {
      const token = await recaptchaVerifier.verify();
      if (!token) {
        throw new Error('reCAPTCHA verification failed');
      }
    } catch (verifyError) {
      console.error('reCAPTCHA verify error:', verifyError);
      throw new Error('reCAPTCHA verification failed');
    }

    // Send verification code
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return { confirmationResult, error: null };
  } catch (error: any) {
    console.error('Phone login error:', error);
    let errorMessage = 'Failed to send verification code';
    
    if (error.code === 'auth/invalid-phone-number') {
      errorMessage = 'Invalid phone number format';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many attempts. Please try again later';
    } else if (error.code === 'auth/quota-exceeded') {
      errorMessage = 'SMS quota exceeded. Please try again later';
    } else if (error.code === 'auth/invalid-app-credential') {
      errorMessage = 'reCAPTCHA verification failed. Please try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { confirmationResult: null, error: errorMessage };
  }
};

const verifyPhoneCode = async (confirmationResult: any, code: string) => {
  try {
    if (!confirmationResult || !code) {
      throw new Error('Confirmation result and verification code are required');
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      throw new Error('Invalid verification code format');
    }

    const result = await confirmationResult.confirm(code);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('Phone verification error:', error);
    let errorMessage = 'Failed to verify code';
    
    if (error.code === 'auth/invalid-verification-code') {
      errorMessage = 'Invalid verification code';
    } else if (error.code === 'auth/code-expired') {
      errorMessage = 'Verification code has expired';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { user: null, error: errorMessage };
  }
};

const updateUserPassword = async (user: User, newPassword: string) => {
  try {
    await updatePassword(user, newPassword);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Current user subscription
const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Export everything needed
export {
  app,
  auth,
  db,
  storage,
  analytics,
  googleProvider,
  facebookProvider,
  registerWithEmailAndPassword,
  loginWithEmailAndPassword,
  loginWithGoogle,
  loginWithFacebook,
  logoutUser,
  resetPassword,
  subscribeToAuthChanges,
  loginWithPhoneNumber,
  verifyPhoneCode,
  RecaptchaVerifier,
  updateUserPassword
}; 