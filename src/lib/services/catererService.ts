
import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Caterer } from "@/lib/types";

const CATERERS_COLLECTION = "traiteur";

/**
 * Adds a new caterer document to the 'traiteur' collection.
 * The document ID will be the caterer's UID.
 * @param uid The UID of the caterer (from Firebase Auth).
 * @param name The full name of the caterer.
 * @param email The email of the caterer.
 */
export async function addCaterer(catererData: Caterer): Promise<void> {
  try {
    const catererRef = doc(db, CATERERS_COLLECTION, catererData.uid);
    await setDoc(catererRef, {
        name: catererData.name,
        email: catererData.email,
    });
  } catch (error) {
    console.error("Error adding caterer: ", error);
    throw new Error("Could not add the caterer.");
  }
}

/**
 * Retrieves all caterers from the 'traiteur' collection.
 * @returns A promise that resolves to an array of caterers.
 */
export async function getAllCaterers(): Promise<Caterer[]> {
  try {
    const caterersCollection = collection(db, CATERERS_COLLECTION);
    const querySnapshot = await getDocs(caterersCollection);

    const caterers: Caterer[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      caterers.push({
        uid: doc.id,
        name: data.name,
        email: data.email,
      });
    });

    return caterers;
  } catch (error) {
    console.error("Error fetching all caterers: ", error);
    throw new Error("Could not fetch caterers.");
  }
}

/**
 * Deletes a caterer from the 'traiteur' collection.
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
