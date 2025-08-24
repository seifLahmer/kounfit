
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Checks for a user's role by checking all role collections in parallel.
 * This is more robust than checking in sequence.
 * @param uid The user's UID from Firebase Auth.
 * @returns A promise that resolves to the user's role or 'unknown'.
 */
export async function getUserRole(uid: string): Promise<'admin' | 'caterer' | 'client' | 'delivery' | 'unknown'> {
  if (!uid) return 'unknown';

  const adminRef = doc(db, "admins", uid);
  const catererRef = doc(db, "caterers", uid);
  const deliveryRef = doc(db, "deliveryPeople", uid);
  const userRef = doc(db, "users", uid);

  try {
    const [adminSnap, catererSnap, deliverySnap, userSnap] = await Promise.all([
      getDoc(adminRef),
      getDoc(catererRef),
      getDoc(deliveryRef),
      getDoc(userRef)
    ]);

    if (adminSnap.exists()) return 'admin';
    if (catererSnap.exists()) return 'caterer';
    if (deliverySnap.exists()) return 'delivery';
    if (userSnap.exists()) return 'client';

    return 'unknown';
  } catch (error) {
    console.error("Error getting user role: ", error);
    // Return 'unknown' in case of error to avoid breaking the login flow.
    return 'unknown';
  }
}
