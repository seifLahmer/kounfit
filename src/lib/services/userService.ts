
import { doc, setDoc, getDoc, serverTimestamp, Timestamp, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
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
    
    const docSnap = await getDoc(userRef);

    const cleanData: { [key: string]: any } = {};

    Object.keys(data).forEach(keyStr => {
      const key = keyStr as keyof typeof data;
      if (data[key] !== undefined) {
        cleanData[key] = data[key];
      }
    });

    const dataToSet = {
      ...cleanData,
      uid,
      updatedAt: serverTimestamp(),
      ...(docSnap.exists() ? {} : { createdAt: serverTimestamp(), role: data.role || 'client' }),
    };

    await setDoc(userRef, dataToSet, { merge: true });
  } catch (error) {
    console.error("Error in updateUserProfile: ", error);
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

    