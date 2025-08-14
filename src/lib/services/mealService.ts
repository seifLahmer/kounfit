
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  Timestamp,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  orderBy,
  runTransaction,
} from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import type { Meal } from "@/lib/types";
import { ref, deleteObject } from "firebase/storage";

const MEALS_COLLECTION = "meals";

/**
 * Adds a new meal to the Firestore 'meals' collection.
 * @param mealData The meal data to save, without the 'id' and 'createdAt'.
 * @returns The ID of the newly created meal document.
 */
export async function addMeal(mealData: Omit<Meal, 'id' | 'createdAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, MEALS_COLLECTION), {
      ...mealData,
      ratings: { average: 0, count: 0 }, // Initialize ratings
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding meal to Firestore: ", error);
    throw new Error("Could not save the meal.");
  }
}

/**
 * Deletes a meal from Firestore and its associated image from Storage.
 * @param mealId The ID of the meal document to delete.
 * @param imageRefPath Optional path to the image in Firebase Storage.
 */
export async function deleteMeal(mealId: string, imageRefPath?: string): Promise<void> {
  const mealDocRef = doc(db, MEALS_COLLECTION, mealId);

  // First, try to delete the image from Firebase Storage if a path is provided.
  if (imageRefPath) {
    try {
      const imageRef = ref(storage, imageRefPath);
      await deleteObject(imageRef);
    } catch (error: any) {
      // We can ignore the "object-not-found" error, as it means the image is already gone.
      // For other storage errors, we log them but proceed to delete the database entry.
      if (error.code !== 'storage/object-not-found') {
        console.error("Error deleting image from Storage: ", error);
      }
    }
  }

  // Then, always attempt to delete the meal document from Firestore.
  try {
    await deleteDoc(mealDocRef);
  } catch (error) {
    console.error("Error deleting meal document from Firestore: ", error);
    throw new Error("Could not delete the meal from the database.");
  }
}


/**
 * Retrieves all meals created by a specific caterer from Firestore.
 * @param catererUid The UID of the caterer.
 * @returns A promise that resolves to an array of meals.
 */
export async function getMealsByCaterer(catererUid: string): Promise<Meal[]> {
    try {
        const mealsCollection = collection(db, MEALS_COLLECTION);
        const q = query(mealsCollection, where("createdBy", "==", catererUid));
        
        const querySnapshot = await getDocs(q);
        
        const meals: Meal[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const meal: Meal = {
                id: doc.id,
                ...data,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            } as Meal;
            meals.push(meal);
        });

        // Sort meals by creation date, newest first
        meals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        return meals;
    } catch (error) {
        console.error("Error fetching meals by caterer: ", error);
        throw new Error("Could not fetch meals.");
    }
}

/**
 * Retrieves all available meals for a specific category, ordered by creation date.
 * @param category The meal category ('breakfast', 'lunch', etc.).
 * @returns A promise that resolves to an array of meals.
 */
export async function getAvailableMealsByCategory(category: Meal['category']): Promise<Meal[]> {
    try {
        const mealsCollection = collection(db, MEALS_COLLECTION);
        const q = query(
            mealsCollection,
            where("availability", "==", true),
            where("category", "==", category)
        );

        const querySnapshot = await getDocs(q);

        const meals: Meal[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const meal: Meal = {
                id: doc.id,
                ...data,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            } as Meal;
            meals.push(meal);
        });
        
        // Sort in code to avoid composite index
        meals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return meals;
    } catch (error) {
        console.error("Error fetching available meals by category: ", error);
        throw new Error("Could not fetch available meals.");
    }
}


/**
 * Retrieves a single meal by its document ID.
 * @param mealId The ID of the meal document.
 * @returns A promise that resolves to the meal data, or null if not found.
 */
export async function getMealById(mealId: string): Promise<Meal | null> {
    try {
        const mealRef = doc(db, MEALS_COLLECTION, mealId);
        const docSnap = await getDoc(mealRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const meal: Meal = {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            } as Meal;
            return meal;
        } else {
            console.log("No such meal document!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching meal by ID: ", error);
        throw new Error("Could not fetch the meal.");
    }
}


/**
 * Retrieves a list of meals based on their IDs.
 * @param mealIds An array of meal IDs.
 * @returns A promise that resolves to an array of meals.
 */
export async function getFavoriteMeals(mealIds: string[]): Promise<Meal[]> {
    if (!mealIds || mealIds.length === 0) {
        return [];
    }

    try {
        const mealsCollection = collection(db, MEALS_COLLECTION);
        const q = query(mealsCollection, where(documentId(), 'in', mealIds));
        const querySnapshot = await getDocs(q);

        const meals: Meal[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const meal: Meal = {
                id: doc.id,
                ...data,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            } as Meal;
            meals.push(meal);
        });

        return meals;
    } catch (error) {
        console.error("Error fetching favorite meals: ", error);
        throw new Error("Could not fetch favorite meals.");
    }
}


/**
 * Adds or updates a user's rating for a meal.
 * @param mealId The ID of the meal being rated.
 * @param userId The UID of the user giving the rating.
 * @param rating The rating value (e.g., 1-5).
 */
export async function addMealRating(mealId: string, userId: string, rating: number): Promise<void> {
  const mealRef = doc(db, MEALS_COLLECTION, mealId);
  const ratingRef = doc(db, `meals/${mealId}/userRatings`, userId);

  try {
    await runTransaction(db, async (transaction) => {
      const mealDoc = await transaction.get(mealRef);
      if (!mealDoc.exists()) {
        throw new Error("Meal does not exist!");
      }

      const userRatingDoc = await transaction.get(ratingRef);
      const mealData = mealDoc.data() as Meal;
      
      const currentRatings = mealData.ratings || { average: 0, count: 0 };
      let newTotalRating = currentRatings.average * currentRatings.count;
      let newRatingCount = currentRatings.count;

      if (userRatingDoc.exists()) {
        // User is updating their rating
        const oldRating = userRatingDoc.data().rating;
        newTotalRating = newTotalRating - oldRating + rating;
        // Rating count does not change
      } else {
        // New rating
        newTotalRating += rating;
        newRatingCount++;
      }
      
      const newAverageRating = newTotalRating / newRatingCount;

      // Update the user's specific rating
      transaction.set(ratingRef, { rating, ratedAt: serverTimestamp() });
      
      // Update the aggregated rating on the meal document
      transaction.update(mealRef, {
        "ratings.average": newAverageRating,
        "ratings.count": newRatingCount
      });
    });
  } catch (error) {
    console.error("Error adding meal rating: ", error);
    throw new Error("Could not add meal rating.");
  }
}

/**
 * Retrieves all meal IDs from Firestore.
 * @returns A promise that resolves to an array of meal IDs.
 */
export async function getAllMealIds(): Promise<string[]> {
    try {
        const mealsCollection = collection(db, MEALS_COLLECTION);
        const querySnapshot = await getDocs(mealsCollection);

        const mealIds: string[] = [];
        querySnapshot.forEach((doc) => {
            mealIds.push(doc.id);
        });

        return mealIds;
    } catch (error) {
        console.error("Error fetching all meal IDs: ", error);
        throw new Error("Could not fetch all meal IDs.");
    }
}
