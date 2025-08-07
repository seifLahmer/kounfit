
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ADMINS_COLLECTION = "admins";

/**
 * Adds a new admin document to the 'admins' collection.
 * The document ID will be the admin's UID.
 * @param uid The UID of the admin (from Firebase Auth).
 * @param email The email of the admin.
 */
export async function addAdmin({ uid, email }: { uid: string, email: string }): Promise<void> {
  try {
    const adminRef = doc(db, ADMINS_COLLECTION, uid);
    // Set the document with the user's UID as the ID.
    await setDoc(adminRef, {
        uid: uid,
        email: email,
        role: 'admin'
    });
  } catch (error) {
    console.error("Error adding admin: ", error);
    throw new Error("Could not add the admin.");
  }
}
