import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, GoogleAuthProvider } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDhJXy_8JJ89CUMhj8iyldXvps_H5R7AHI",
  authDomain: "fithelath.firebaseapp.com",
  projectId: "fithelath",
  storageBucket: "fithelath.firebasestorage.app",
  messagingSenderId: "98685881966",
  appId: "1:98685881966:web:99d8147fde3b9b5847a07f",
};

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

export { app, auth, db, googleProvider, storage };
