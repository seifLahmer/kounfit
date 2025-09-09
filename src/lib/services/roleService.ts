
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Checks for a user's role by checking collections in a specific order.
 * This function is designed to work with Firestore security rules where a user may not have 
 * permission to read a collection that does not correspond to their role.
 * Order: admin > caterer > delivery > client
 * @param uid The user's UID from Firebase Auth.
 * @returns A promise that resolves to the user's role. Defaults to 'client' if no role is found. Returns 'unknown' on unexpected errors.
 */
export async function getUserRole(uid: string): Promise<'admin' | 'caterer' | 'client' | 'delivery' | 'unknown' | 'error'> {
  if (!uid) return 'unknown';
  console.log(uid)
  // The order defines the role priority.
  const collectionsToCheck: Array<{ name: 'admins' | 'caterers' | 'deliveryPeople' | 'users'; role: 'admin' | 'caterer' | 'delivery' | 'client' }> = [
    { name: 'admins', role: 'admin' },
    { name: 'caterers', role: 'caterer' },
    { name: 'deliveryPeople', role: 'delivery' },
    { name: 'users', role: 'client' },
  ];

  for (const collection of collectionsToCheck) {
    console.log ("hiiiiiii")
    try {
      const docRef = doc(db, collection.name, uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // User found in a collection, this is their role.
        console.log(collection.role)
        return collection.role;
      }
    } catch (error: any) {
      // A 'permission-denied' error is an expected outcome if the user's security rules
      // prevent them from reading a collection they don't belong to. We can ignore it.
      if (error.code === 'permission-denied') {
        console.log("hello")
        continue; // This is not the user's role, try the next collection.
      } else {
        // For other errors (e.g., network issues, service unavailable), we should fail.
        console.error(`Error checking role in '${collection.name}':`, error);
        return 'unknown'; // Fail safely on unexpected errors.
      }
    }
  }

  // If the user's UID is not found in any of the primary role collections
  // (e.g., during the signup process before a user document is created),
  // we default to 'client'. This allows them to proceed to the next step
  // of signup where the 'users' document will be created.
  return 'error';
}
