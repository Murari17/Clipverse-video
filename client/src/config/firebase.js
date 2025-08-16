import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBXSvC0bs1T4_T47u-Z1AFfDGMRSvcEFyY",
  authDomain: "videoplayer-6e902.firebaseapp.com",
  projectId: "videoplayer-6e902",
  storageBucket: "videoplayer-6e902.firebasestorage.app",
  messagingSenderId: "26302172679",
  appId: "1:26302172679:web:9c09ef6f32a0a6314f24a2",
  measurementId: "G-R4G8WVTHGS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and get a reference to the service
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Google Sign In function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: result.user
    };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default app;
