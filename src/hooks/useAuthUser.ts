"use client";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { User } from "@/lib/types";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const collections = ["users", "caterers", "deliveryPeople", "admins"];
        let foundUser = false;

        for (const collectionName of collections) {
          try {
            const userDocRef = doc(db, collectionName, firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUser(userDoc.data() as User);
              foundUser = true;
              break;
            }
          } catch (error) {
            console.error(`Error checking collection ${collectionName}:`, error);
          }
        }

        if (!foundUser) {
          // Handle case where user is authenticated but not in any of the collections
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
