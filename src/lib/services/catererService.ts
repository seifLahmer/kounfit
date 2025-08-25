
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
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
      role: 'caterer', // Ensure role is set
      status: catererData.status || 'pending', // Default status to pending if not provided
    });
  } catch (error) {
    console.error("Error adding caterer: ", error);
    throw new Error("Could not add the caterer.");
  }
}

/**
 * Updates a caterer's profile data.
 * @param uid The UID of the caterer to update.
 * @param data The data to update.
 */
export async function updateCaterer(uid: string, data: Partial<Caterer>): Promise<void> {
  try {
    const catererRef = doc(db, CATERERS_COLLECTION, uid);
    await updateDoc(catererRef, data);
  } catch (error) {
    console.error("Error updating caterer profile: ", error);
    throw new Error("Could not update caterer profile.");
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
 * Retrieves all caterers with a 'pending' status.
 * @returns A promise that resolves to an array of pending caterers.
 */
export async function getPendingCaterers(): Promise<Caterer[]> {
    try {
        const q = query(collection(db, CATERERS_COLLECTION), where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Caterer));
    } catch (error) {
        console.error("Error fetching pending caterers:", error);
        throw new Error("Could not fetch pending caterers.");
    }
}


/**
 * Updates the status of a specific caterer.
 * @param uid The UID of the caterer to update.
 * @param status The new status.
 */
export async function updateCatererStatus(uid: string, status: 'approved' | 'rejected'): Promise<void> {
    try {
        const catererRef = doc(db, CATERERS_COLLECTION, uid);
        await updateDoc(catererRef, { status });
    } catch (error) {
        console.error("Error updating caterer status:", error);
        throw new Error("Could not update caterer status.");
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
