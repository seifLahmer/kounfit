import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getUserRole(uid: string): Promise<'admin' | 'caterer' | 'client' | 'unknown'> {
  // If no user is logged in, we don't need to check roles.
  if (!uid) return 'unknown';
  
  try {
    // 1. Check if the user is in the 'users' collection. This is the primary source of truth for clients.
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      // Return the role if it's explicitly defined, otherwise default to client.
      if (userData.role && ['admin', 'caterer', 'client'].includes(userData.role)) {
        return userData.role;
      }
      return 'client';
    }

    // 2. Check for admin role as a fallback.
    const adminRef = doc(db, "admin", uid);
    const adminSnap = await getDoc(adminRef);
    if (adminSnap.exists()) {
      return 'admin';
    }

    // 3. Check for caterer role as a fallback.
    const catererRef = doc(db, "traiteur", uid);
    const catererSnap = await getDoc(catererRef);
    if (catererSnap.exists()) {
      return 'caterer';
    }

    // 4. If a user exists in Auth but has no document anywhere,
    // this could be a new sign-up. The layouts will handle redirection to onboarding.
    // We can return 'unknown' to let the layouts decide.
    return 'unknown';
  } catch (error) {
      console.error("Error getting user role: ", error);
      // Return 'unknown' on error to prevent incorrect access.
      return 'unknown';
  }
}
