
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User } from "@/lib/types";

// Firestore collection reference
const USERS_COLLECTION = "users";

/**
 * Creates or updates a user's profile in Firestore.
 * It removes any undefined fields before saving.
 * @param uid The user's unique ID from Firebase Auth.
 * @param data The user profile data to save.
 */
export async function updateUserProfile(uid: string, data: Partial<Omit<User, 'uid'>>) {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    // Check if document exists to determine if it's a create or update
    const docSnap = await getDoc(userRef);

    const cleanData: Partial<Omit<User, 'uid'>> = { ...data };

    // Firestore does not support 'undefined' values. We need to remove them.
    Object.keys(cleanData).forEach(keyStr => {
      const key = keyStr as keyof typeof cleanData;
      if (cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });

    const dataToSet = {
      ...cleanData,
      uid,
      updatedAt: serverTimestamp(),
      // Only set createdAt on initial creation
      ...(docSnap.exists() ? {} : { createdAt: serverTimestamp(), role: data.role || 'client' }),
    };

    // Use setDoc with merge: true to create or update the document
    await setDoc(userRef, dataToSet, { merge: true });
    console.log("User profile updated successfully for UID:", uid);
  } catch (error) {
    console.error("Error updating user profile:", error);
    // Re-throw the original error for better debugging in the calling function
    throw error;
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
      // Convert Firestore Timestamps to Dates
      const data = docSnap.data() as User;
      if (data.createdAt && data.createdAt instanceof Timestamp) {
        data.createdAt = data.createdAt.toDate();
      }
      if (data.updatedAt && data.updatedAt instanceof Timestamp) {
        data.updatedAt = data.updatedAt.toDate();
      }
      return data;
    } else {
      console.log("No such user profile found for UID:", uid);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Could not fetch user profile.");
  }
}
