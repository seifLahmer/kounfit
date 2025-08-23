
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Checks for a user's role by checking collections in a specific order: admins, caterers, then users.
 * @param uid The user's UID from Firebase Auth.
 * @returns A promise that resolves to the user's role or 'unknown'.
 */
export async function getUserRole(uid: string): Promise<'admin' | 'caterer' | 'client' | 'delivery' | 'unknown'> {
  if (!uid) return 'unknown';

  try {
    // 1. Check for admin role
    const adminRef = doc(db, "admins", uid);
    const adminSnap = await getDoc(adminRef);
    if (adminSnap.exists()) {
      return 'admin';
    }

    // 2. Check for caterer role
    const catererRef = doc(db, "caterers", uid);
    const catererSnap = await getDoc(catererRef);
    if (catererSnap.exists()) {
      return 'caterer';
    }
    
    // 3. Check for delivery role
    const deliveryRef = doc(db, "deliveryPeople", uid);
    const deliverySnap = await getDoc(deliveryRef);
    if (deliverySnap.exists()) {
      return 'delivery';
    }

    // 4. Check for client role
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return 'client';
    }

    // 5. If user is in Auth but not in any role collection
    return 'unknown';
  } catch (error) {
    console.error("Error getting user role: ", error);
    return 'unknown';
  }
}
