
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Checks for a user's role by checking collections in a specific order.
 * This is more robust for assigning a definitive role.
 * Order: admin > caterer > delivery > client
 * @param uid The user's UID from Firebase Auth.
 * @returns A promise that resolves to the user's role or 'unknown'.
 */
export async function getUserRole(uid: string): Promise<'admin' | 'caterer' | 'client' | 'delivery' | 'unknown'> {
  if (!uid) return 'unknown';

  try {
    // Check in order of priority
    const adminRef = doc(db, "admins", uid);
    const adminSnap = await getDoc(adminRef);
    if (adminSnap.exists()) {
      return 'admin';
    }

    const catererRef = doc(db, "caterers", uid);
    const catererSnap = await getDoc(catererRef);
    if (catererSnap.exists()) {
      return 'caterer';
    }

    const deliveryRef = doc(db, "deliveryPeople", uid);
    const deliverySnap = await getDoc(deliveryRef);
    if (deliverySnap.exists()) {
      return 'delivery';
    }

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return 'client';
    }

    return 'unknown';
  } catch (error) {
    console.error("Error getting user role: ", error);
    // In case of a permissions error during the check, it's safer to return 'unknown'
    // than to let the login flow break.
    return 'unknown';
  }
}
