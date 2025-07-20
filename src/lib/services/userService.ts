
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User } from "@/lib/types";

// Firestore collection reference
const USERS_COLLECTION = "users";

/**
 * Creates or updates a user's profile in Firestore.
 * @param uid The user's unique ID from Firebase Auth.
 * @param data The user profile data to save.
 */
export async function updateUserProfile(uid: string, data: Partial<Omit<User, 'uid' | 'email' | 'role'>>) {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    // Use setDoc with merge: true to create or update the document
    await setDoc(userRef, data, { merge: true });
    console.log("User profile updated successfully for UID:", uid);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Could not update user profile.");
  }
}

/**
 * Retrieves a user's profile from Firestore.
 * @param uid The user's unique ID.
 * @returns The user data or null if not found.
 */
export async function getUserProfile(uid: string): Promise<User | null> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return docSnap.data() as User;
    } else {
      console.log("No such user profile found for UID:", uid);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Could not fetch user profile.");
  }
}
