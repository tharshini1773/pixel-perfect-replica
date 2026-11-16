import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyCmNFx5PsunzRnQ460ZSv_ZEWWfPSwMN7Y",
  authDomain: "tharshini-website.firebaseapp.com",
  projectId: "tharshini-website",
  storageBucket: "tharshini-website.firebasestorage.app",
  messagingSenderId: "89705895947",
  appId: "1:89705895947:web:c88936d60df4030080cf0e",
  measurementId: "G-RHFXWNKHQ8",
};

// Singleton Firebase App and Auth instances
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);

// Authorized administrator email address
export const AUTHORIZED_ADMIN_EMAIL = "tharshini1773@gmail.com";

// Helper to convert Firebase error codes to human-readable error messages
export function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Incorrect email or password. Please verify your credentials and try again.";
    case "auth/user-not-found":
      return "No account found with this email address in Firebase Authentication. Please make sure the account is registered in the Firebase console.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This administrator account has been disabled. Please contact support.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Access to this account has been temporarily disabled. Please reset your password or try again later.";
    case "auth/network-request-failed":
      return "Network connection failed. Please check your internet connection.";
    case "auth/configuration-not-found":
      return "Firebase Authentication is not yet enabled for this project. Please enable Email/Password provider in the Firebase Console (Authentication > Sign-in method).";
    case "auth/operation-not-allowed":
      return "Email/Password sign-in is disabled in your Firebase console. Please enable Email/Password under Authentication > Sign-in method.";
    default:
      return "Authentication failed. Please verify your credentials or check your Firebase configuration.";
  }
}
