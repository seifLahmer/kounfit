
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Meal } from "@/lib/types";

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
