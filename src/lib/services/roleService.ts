import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getUserRole(uid: string): Promise<'admin' | 'caterer' | 'client' | 'unknown'> {
  if (!uid) return 'unknown';
  
  try {
    // 1. Check the primary 'users' collection first. This should be the main source of truth.
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.role && ['admin', 'caterer', 'client'].includes(userData.role)) {
        return userData.role;
      }
    }

    // 2. Fallback check for admin in the 'admin' collection for robustness.
    const adminRef = doc(db, "admin", uid);
    const adminSnap = await getDoc(adminRef);
    if (adminSnap.exists()) {
      return 'admin';
    }

    // 3. Fallback check for caterer in the 'traiteur' collection.
    const catererRef = doc(db, "traiteur", uid);
    const catererSnap = await getDoc(catererRef);
    if (catererSnap.exists()) {
      return 'caterer';
    }

    // 4. If a user exists in Auth but has no document in 'users' or role-specific collections,
    // they are treated as a 'client' by default. This handles new sign-ups.
    return 'client';
  } catch (error) {
      console.error("Error getting user role: ", error);
      // Return 'unknown' on error to prevent incorrect access. The layout will redirect to /welcome.
      return 'unknown';
  }
}
