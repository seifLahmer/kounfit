
import { doc, setDoc, collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DeliveryPerson } from "@/lib/types";

const DELIVERY_PEOPLE_COLLECTION = "deliveryPeople";

/**
 * Adds a new delivery person document to the 'deliveryPeople' collection.
 * @param deliveryPersonData The data for the new delivery person.
 */
export async function addDeliveryPerson(deliveryPersonData: DeliveryPerson): Promise<void> {
  try {
    const deliveryPersonRef = doc(db, DELIVERY_PEOPLE_COLLECTION, deliveryPersonData.uid);
    await setDoc(deliveryPersonRef, {
      ...deliveryPersonData,
      role: 'delivery',
      status: deliveryPersonData.status || 'pending', // Default status to pending
    });
  } catch (error) {
    console.error("Error adding delivery person: ", error);
    throw new Error("Could not add the delivery person.");
  }
}


/**
 * Retrieves all delivery people from the 'deliveryPeople' collection.
 * @returns A promise that resolves to an array of delivery people.
 */
export async function getAllDeliveryPeople(): Promise<DeliveryPerson[]> {
    try {
        const querySnapshot = await getDocs(collection(db, DELIVERY_PEOPLE_COLLECTION));
        return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as DeliveryPerson));
    } catch (error) {
        console.error("Error fetching all delivery people:", error);
        throw new Error("Could not fetch delivery people.");
    }
}

/**
 * Retrieves all delivery people with a 'pending' status.
 * @returns A promise that resolves to an array of pending delivery people.
 */
export async function getPendingDeliveryPeople(): Promise<DeliveryPerson[]> {
    try {
        const q = query(collection(db, DELIVERY_PEOPLE_COLLECTION), where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as DeliveryPerson));
    } catch (error) {
        console.error("Error fetching pending delivery people:", error);
        throw new Error("Could not fetch pending delivery people.");
    }
}


/**
 * Updates the status of a specific delivery person.
 * @param uid The UID of the delivery person to update.
 * @param status The new status.
 */
export async function updateDeliveryPersonStatus(uid: string, status: 'approved' | 'rejected'): Promise<void> {
    try {
        const deliveryPersonRef = doc(db, DELIVERY_PEOPLE_COLLECTION, uid);
        await updateDoc(deliveryPersonRef, { status });
    } catch (error) {
        console.error("Error updating delivery person status:", error);
        throw new Error("Could not update delivery person status.");
    }
}
