
import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Caterer } from "@/lib/types";

const CATERERS_COLLECTION = "caterers";

/**
 * Adds a new caterer document to the 'caterers' collection.
 * The document ID will be the caterer's UID.
 * @param catererData The caterer data to be added.
 */
export async function addCaterer(catererData: Omit<Caterer, 'turnover'>): Promise<void> {
  try {
    const catererRef = doc(db, CATERERS_COLLECTION, catererData.uid);
    await setDoc(catererRef, {
      ...catererData,
      role: 'caterer' // Ensure role is set
    });
  } catch (error) {
    console.error("Error adding caterer: ", error);
    throw new Error("Could not add the caterer.");
  }
}

/**
 * Retrieves all caterers from the 'caterers' collection.
 * @returns A promise that resolves to an array of caterers.
 */
export async function getAllCaterers(): Promise<Caterer[]> {
  try {
    const caterersCollection = collection(db, CATERERS_COLLECTION);
    const querySnapshot = await getDocs(caterersCollection);

    const caterers: Caterer[] = querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as Caterer));
    
    return caterers;
  } catch (error) {
    console.error("Error fetching all caterers: ", error);
    throw new Error("Could not fetch caterers.");
  }
}

/**
 * Deletes a caterer from the 'caterers' collection.
 * @param uid The UID of the caterer to delete.
 */
export async function deleteCaterer(uid: string): Promise<void> {
  try {
    const catererRef = doc(db, CATERERS_COLLECTION, uid);
    await deleteDoc(catererRef);
  } catch (error) {
    console.error("Error deleting caterer: ", error);
    throw new Error("Could not delete the caterer.");
  }
}
