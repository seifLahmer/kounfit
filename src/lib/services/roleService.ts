import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getUserRole(uid: string): Promise<'admin' | 'caterer' | 'client' | 'unknown'> {
  if (!uid) return 'unknown';
  
  try {
    // 1. Check the primary 'users' collection first, as it should be the source of truth.
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.role && ['admin', 'caterer', 'client'].includes(userData.role)) {
        return userData.role;
      }
    }

    // 2. Fallback to checking individual role collections for robustness.
    const adminRef = doc(db, "admin", uid);
    const adminSnap = await getDoc(adminRef);
    if (adminSnap.exists()) {
      return 'admin';
    }

    const catererRef = doc(db, "traiteur", uid);
    const catererSnap = await getDoc(catererRef);
    if (catererSnap.exists()) {
      return 'caterer';
    }

    // 3. If no specific role is found in any collection, default to 'client'.
    // This handles cases where a user might exist in Auth but not yet in Firestore.
    return 'client';
  } catch (error) {
      console.error("Error getting user role: ", error);
      return 'unknown'; // Return 'unknown' on error to prevent incorrect redirection
  }
}
