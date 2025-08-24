import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import getConfig from 'next/config';

// Use Next.js runtime config to get environment variables
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig() || { serverRuntimeConfig: {}, publicRuntimeConfig: {} };

const firebaseConfig = {
  apiKey: publicRuntimeConfig.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: publicRuntimeConfig.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: publicRuntimeConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: publicRuntimeConfig.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: publicRuntimeConfig.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: publicRuntimeConfig.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Also set the Gemini API key for server-side Genkit usage
if (serverRuntimeConfig.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = serverRuntimeConfig.GEMINI_API_KEY;
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let googleProvider: GoogleAuthProvider;


if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);
googleProvider = new GoogleAuthProvider();


export { app, db, auth, storage, googleProvider };
