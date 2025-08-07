
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getUserRole(uid: string): Promise<'admin' | 'caterer' | 'client' | 'unknown'> {
  // If no user is logged in, we don't need to check roles.
  if (!uid) return 'unknown';
  
  try {
    // Check collections in order of privilege: admin -> caterer -> client
    
    // 1. Check for admin role in the 'admin' collection (singular).
    const adminRef = doc(db, "admin", uid);
    const adminSnap = await getDoc(adminRef);
    if (adminSnap.exists()) {
      return 'admin';
    }

    // 2. Check for caterer role in the 'caterers' collection (plural).
    const catererRef = doc(db, "caterers", uid);
    const catererSnap = await getDoc(catererRef);
    if (catererSnap.exists()) {
      return 'caterer';
    }
    
    // 3. Check if the user is in the 'users' collection (clients).
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return 'client';
    }

    // 4. If a user exists in Auth but has no document anywhere, they are considered 'unknown'.
    // This could be a new sign-up or an improperly configured user.
    return 'unknown';
  } catch (error) {
      console.error("Error getting user role: ", error);
      // Return 'unknown' on error to prevent incorrect access.
      return 'unknown';
  }
}
