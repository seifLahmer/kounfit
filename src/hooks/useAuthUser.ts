"use client";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { User } from "@/lib/types";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const collections = ["users", "caterers", "deliveryPeople", "admins"];
          const promises = collections.map(async (collectionName) => {
            const userDoc = await getDoc(doc(db, collectionName, firebaseUser.uid));
            return userDoc.exists() ? (userDoc.data() as User) : null;
          });

          const results = await Promise.all(promises);
          const foundUser = results.find((u) => u !== null) || null;
          setUser(foundUser);
        } else {
          setUser(null);
        }
      } catch (e: any) {
        // Stringify the entire error object to get the raw system error
        const errorString = JSON.stringify(e, Object.getOwnPropertyNames(e));
        setError(errorString);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
}
