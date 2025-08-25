
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";

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
    const docSnap = await getDoc(adminRef);

    if (docSnap.exists()) {
      console.log(`Admin with UID ${uid} already exists.`);
      return;
    }
    
    // Set the document with the user's UID as the ID.
    await setDoc(adminRef, {
        uid: uid,
        email: email,
        role: 'admin'
    });
    
    // After creating the doc, set the custom claim.
    await setAdminClaim({ uid });

  } catch (error) {
    console.error("Error adding admin: ", error);
    throw new Error("Could not add the admin.");
  }
}

/**
 * Sets a custom 'admin' claim on a user's Firebase Auth token.
 * NOTE: This requires a Cloud Function to be deployed.
 * For local development, this function might need to be triggered manually
 * or via an admin interface once created.
 * @param uid The UID of the user to make an admin.
 */
export async function setAdminClaim({ uid }: { uid: string }): Promise<void> {
    // This function assumes you have a callable Cloud Function named 'setAdminClaim'
    // that handles the logic of setting custom claims.
    console.log(`
      ********************************************************************************
      ACTION REQUIRED: Setting admin claim for user ${uid}.
      This requires a deployed Cloud Function 'setAdminClaim'.
      If you are developing locally, you might need to run a script to set this claim.
      See Firebase documentation on 'Controlling Access with Custom Claims'.
      ********************************************************************************
    `);
    // Placeholder for actual function call. In a real app, you would have:
    // const functions = getFunctions();
    // const setAdmin = httpsCallable(functions, 'setAdminClaim');
    // await setAdmin({ uid: uid });
}
