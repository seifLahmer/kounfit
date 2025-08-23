import { doc, setDoc } from "firebase/firestore";
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
