
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDhJXy_8JJ89CUMhj8iyldXvps_H5R7AHI",
  authDomain: "fithelath.firebaseapp.com",
  projectId: "fithelath",
  storageBucket: "fithelath.firebasestorage.app",
  messagingSenderId: "98685881966",
  appId: "1:98685881966:web:99d8147fde3b9b5847a07f",
  measurementId: "G-5H8DNGBVW0"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);


export { app, db, auth, storage };
