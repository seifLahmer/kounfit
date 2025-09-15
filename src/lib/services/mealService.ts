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
  runTransaction,
} from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import type { Meal, Caterer } from "@/lib/types";
import { ref, deleteObject } from "firebase/storage";

const MEALS_COLLECTION = "meals";
const CATERERS_COLLECTION = "caterers";

/**
 * Adds a new meal to Firestore.
 */
export async function addMeal(mealData: Omit<Meal, "id" | "createdAt">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, MEALS_COLLECTION), {
      ...mealData,
      ratings: { average: 0, count: 0 },
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding meal: ", error);
    throw new Error("Could not save the meal.");
  }
}

/**
 * Deletes a meal and optionally its image from Firebase Storage.
 */
export async function deleteMeal(mealId: string, imageRefPath?: string): Promise<void> {
  const mealDocRef = doc(db, MEALS_COLLECTION, mealId);

  if (imageRefPath) {
    try {
      const imageRef = ref(storage, imageRefPath);
      await deleteObject(imageRef);
    } catch (error: any) {
      if (error.code !== "storage/object-not-found") {
        console.error("Error deleting image from Storage: ", error);
      }
    }
  }

  try {
    await deleteDoc(mealDocRef);
  } catch (error) {
    console.error("Error deleting meal document: ", error);
    throw new Error("Could not delete the meal.");
  }
}

/**
 * Retrieves all meals created by a specific caterer.
 */
export async function getMealsByCaterer(catererUid: string): Promise<Meal[]> {
  try {
    const mealsCollection = collection(db, MEALS_COLLECTION);
    const q = query(mealsCollection, where("createdBy", "==", catererUid));

    const querySnapshot = await getDocs(q);
    const meals: Meal[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      meals.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      } as Meal);
    });

    meals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return meals;
  } catch (error) {
    console.error("Error fetching meals by caterer: ", error);
    throw new Error("Could not fetch meals.");
  }
}

/**
 * Retrieves all available meals for a category and region.
 * Handles Firestore 'in' query limit by batching caterer IDs.
 */
export async function getAvailableMealsByCategory(
  category: Meal["category"],
  region: string
): Promise<Meal[]> {
  try {
    // Get approved caterers in the region
    const caterersRef = collection(db, CATERERS_COLLECTION);
    const regionQuery = query(caterersRef, where("region", "==", region), where("status", "==", "approved"));
    const catererSnapshot = await getDocs(regionQuery);

    if (catererSnapshot.empty) return [];

    const catererIds = catererSnapshot.docs.map((doc) => doc.id);

    // Firestore 'in' queries allow max 10 items, so batch them
    const batches: string[][] = [];
    for (let i = 0; i < catererIds.length; i += 10) {
      batches.push(catererIds.slice(i, i + 10));
    }

    const meals: Meal[] = [];
    for (const batch of batches) {
      const mealsCollection = collection(db, MEALS_COLLECTION);
      const mealsQuery = query(
        mealsCollection,
        where("availability", "==", true),
        where("category", "==", category),
        where("createdBy", "in", batch)
      );

      const querySnapshot = await getDocs(mealsQuery);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        meals.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        } as Meal);
      });
    }

    meals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return meals;
  } catch (error) {
    console.error("Error fetching available meals: ", error);
    throw new Error("Could not fetch available meals.");
  }
}

/**
 * Retrieves a single meal by ID.
 */
export async function getMealById(mealId: string): Promise<Meal | null> {
  try {
    const mealRef = doc(db, MEALS_COLLECTION, mealId);
    const docSnap = await getDoc(mealRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    } as Meal;
  } catch (error) {
    console.error("Error fetching meal by ID: ", error);
    throw new Error("Could not fetch the meal.");
  }
}

/**
 * Retrieves a list of meals by IDs.
 */
export async function getFavoriteMeals(mealIds: string[]): Promise<Meal[]> {
  if (!mealIds || mealIds.length === 0) return [];

  try {
    const batches: string[][] = [];
    for (let i = 0; i < mealIds.length; i += 10) {
      batches.push(mealIds.slice(i, i + 10));
    }

    const meals: Meal[] = [];
    for (const batch of batches) {
      const mealsCollection = collection(db, MEALS_COLLECTION);
      const q = query(mealsCollection, where(documentId(), "in", batch));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        meals.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        } as Meal);
      });
    }

    return meals;
  } catch (error) {
    console.error("Error fetching favorite meals: ", error);
    throw new Error("Could not fetch favorite meals.");
  }
}

/**
 * Adds or updates a user's rating for a meal.
 */
export async function addMealRating(mealId: string, userId: string, rating: number): Promise<void> {
  const mealRef = doc(db, MEALS_COLLECTION, mealId);
  const ratingRef = doc(db, `meals/${mealId}/userRatings`, userId);

  try {
    await runTransaction(db, async (transaction) => {
      const mealDoc = await transaction.get(mealRef);
      if (!mealDoc.exists()) throw new Error("Meal does not exist!");

      const userRatingDoc = await transaction.get(ratingRef);
      const mealData = mealDoc.data() as Meal;

      const currentRatings = mealData.ratings || { average: 0, count: 0 };
      let newTotalRating = currentRatings.average * currentRatings.count;
      let newRatingCount = currentRatings.count;

      if (userRatingDoc.exists()) {
        const oldRating = userRatingDoc.data().rating;
        newTotalRating = newTotalRating - oldRating + rating;
      } else {
        newTotalRating += rating;
        newRatingCount++;
      }

      const newAverageRating = newTotalRating / newRatingCount;

      transaction.set(ratingRef, { rating, ratedAt: serverTimestamp() });
      transaction.update(mealRef, {
        "ratings.average": newAverageRating,
        "ratings.count": newRatingCount,
      });
    });
  } catch (error) {
    console.error("Error adding meal rating: ", error);
    throw new Error("Could not add meal rating.");
  }
}

/**
 * Retrieves all meal IDs.
 */
export async function getAllMealIds(): Promise<{ id: string }[]> {
  try {
    const mealsCollection = collection(db, MEALS_COLLECTION);
    const querySnapshot = await getDocs(mealsCollection);
    return querySnapshot.docs.map((doc) => ({ id: doc.id }));
  } catch (error) {
    console.error("Error fetching all meal IDs: ", error);
    throw new Error("Could not fetch all meal IDs.");
  }
}
