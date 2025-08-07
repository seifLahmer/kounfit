
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Checks for a user's role by checking collections in a specific order: admin, caterers, then users.
 * @param uid The user's UID from Firebase Auth.
 * @returns A promise that resolves to the user's role or 'unknown'.
 */
export async function getUserRole(uid: string): Promise<'admin' | 'caterer' | 'client' | 'unknown'> {
  if (!uid) return 'unknown';

  try {
    // 1. Check for admin role in 'admin' collection (singular as requested)
    const adminRef = doc(db, "admin", uid);
    const adminSnap = await getDoc(adminRef);
    if (adminSnap.exists()) {
      return 'admin';
    }

    // 2. Check for caterer role in 'caterers' collection
    const catererRef = doc(db, "caterers", uid);
    const catererSnap = await getDoc(catererRef);
    if (catererSnap.exists()) {
      return 'caterer';
    }
    
    // 3. Check for client role in 'users' collection
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return 'client';
    }

    // 4. If user is in Auth but not in any role collection (e.g., interrupted signup)
    return 'unknown';
  } catch (error) {
    console.error("Error getting user role: ", error);
    // Return 'unknown' on error to prevent total failure, allows for graceful handling
    return 'unknown';
  }
}
