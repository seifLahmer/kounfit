
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
  try {
    // Delete the image from Firebase Storage if a reference path exists
    if (imageRefPath) {
      const imageRef = ref(storage, imageRefPath);
      await deleteObject(imageRef);
    }
    
    // Delete the meal document from Firestore
    const mealDocRef = doc(db, MEALS_COLLECTION, mealId);
    await deleteDoc(mealDocRef);
    
  } catch (error) {
    console.error("Error deleting meal: ", error);
    // If the image doesn't exist, it might throw an error we can ignore.
    // We check if the error is about the object not being found.
    if ((error as any).code === 'storage/object-not-found') {
        console.warn("Image not found in storage, but continuing to delete firestore doc.");
         const mealDocRef = doc(db, MEALS_COLLECTION, mealId);
         await deleteDoc(mealDocRef);
    } else {
        throw new Error("Could not delete the meal.");
    }
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
 * Retrieves all available meals for a specific category.
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

        return meals;
    } catch (error) {
        console.error("Error fetching available meals by category: ", error);
        throw new Error("Could not fetch available meals.");
    }
}

    