
import { doc, setDoc, getDoc, serverTimestamp, Timestamp, updateDoc, arrayUnion, arrayRemove, collection, getCountFromServer } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import type { User } from "@/lib/types";
import { sendPasswordResetEmail } from "firebase/auth";

// Firestore collection reference
const USERS_COLLECTION = "users";

/**
 * Creates or updates a user's profile in Firestore.
 * This is intended for CLIENT users only.
 * It removes any undefined fields before saving.
 * @param uid The user's unique ID from Firebase Auth.
 * @param data The user profile data to save.
 */
export async function updateUserProfile(uid: string, data: Partial<Omit<User, 'uid'>>) {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    const docSnap = await getDoc(userRef);

    const cleanData: { [key: string]: any } = {};

    Object.keys(data).forEach(keyStr => {
      const key = keyStr as keyof typeof data;
      const value = data[key];
      // Keep photoURL even if it's null, but remove other undefined fields
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });
    
    // Explicitly set the role to 'client' and remove it from dynamic data
    // to prevent other roles from being saved in the 'users' collection.
    delete cleanData.role; 

    const dataToSet = {
      ...cleanData,
      uid,
      role: 'client', // Hardcode role to 'client' for this collection
      updatedAt: serverTimestamp(),
      ...(docSnap.exists() ? {} : { createdAt: serverTimestamp() }),
    };

    await setDoc(userRef, dataToSet, { merge: true });
  } catch (error) {
    console.error("Error in updateUserProfile: ", error);
    throw new Error(`Failed to update user profile: ${error}`);
  }
}


/**
 * Retrieves a user's profile from Firestore.
 * @param uid The user's unique ID.
 * @returns The user data or null if not found.
 */
export async function getUserProfile(uid: string): Promise<User | null> {
  try {
    if (!uid) {
        return null;
    }
    const userRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as User;
      if (data.createdAt && data.createdAt instanceof Timestamp) {
        data.createdAt = data.createdAt.toDate();
      }
      if (data.updatedAt && data.updatedAt instanceof Timestamp) {
        data.updatedAt = data.updatedAt.toDate();
      }
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Could not fetch user profile.", error);
    // It's better to let the calling function decide what to do with the error
    // than to crash the entire app here.
    throw new Error("Could not fetch user profile.");
  }
}

/**
 * Toggles a meal's favorite status for a user.
 * Adds the mealId if it doesn't exist in favorites, removes it if it does.
 * @param uid The user's unique ID.
 * @param mealId The ID of the meal to toggle.
 * @returns The updated array of favorite meal IDs.
 */
export async function toggleFavoriteMeal(uid: string, mealId: string): Promise<string[]> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    try {
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
            throw new Error("User profile not found.");
        }

        const userData = docSnap.data() as User;
        const currentFavorites = userData.favoriteMealIds || [];
        
        let updatedFavorites: string[];

        if (currentFavorites.includes(mealId)) {
            // Remove from favorites
            await updateDoc(userRef, {
                favoriteMealIds: arrayRemove(mealId)
            });
            updatedFavorites = currentFavorites.filter(id => id !== mealId);
        } else {
            // Add to favorites
            await updateDoc(userRef, {
                favoriteMealIds: arrayUnion(mealId)
            });
            updatedFavorites = [...currentFavorites, mealId];
        }
        
        return updatedFavorites;
    } catch (error) {
        console.error("Error toggling favorite meal: ", error);
        throw new Error("Could not update favorites.");
    }
}

/**
 * Gets the total count of users in the 'users' collection.
 * @returns A promise that resolves to the number of users.
 */
export async function getUserCount(): Promise<number> {
    try {
        const usersCollection = collection(db, USERS_COLLECTION);
        const snapshot = await getCountFromServer(usersCollection);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error getting user count: ", error);
        throw new Error("Could not get user count.");
    }
}

/**
 * Sends a password reset email to the user.
 * @param email The user's email address.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email: ", error);
    throw new Error("Failed to send password reset email.");
  }
}
