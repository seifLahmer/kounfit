
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Uploads a user's profile image to Firebase Storage.
 * The path will be `profile-images/{uid}/{file.name}`.
 * This function will throw an error if the upload fails, which should be caught by the caller.
 * @param uid The user's unique ID.
 * @param file The image file to upload.
 * @returns The public URL of the uploaded image.
 */
export async function uploadProfileImage(uid: string, file: File): Promise<string> {
  if (!uid || !file) {
    throw new Error("User ID and file must be provided.");
  }
  const storageRef = ref(storage, `profile-images/${uid}/${file.name}`);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Firebase Storage Error:", error);
    throw error;
  }
}

/**
 * Uploads a meal image to Firebase Storage.
 * The path will be `meal-images/{catererUid}/{file.name}`.
 * @param catererUid The caterer's unique ID.
 * @param file The image file to upload.
 * @returns An object containing the public URL and the storage path of the uploaded image.
 */
export async function uploadMealImage(catererUid: string, file: File): Promise<{ downloadURL: string, imagePath: string }> {
  if (!catererUid || !file) {
    throw new Error("Caterer ID and file must be provided.");
  }
  
  // Create a unique file name to avoid conflicts
  const imagePath = `meal-images/${catererUid}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, imagePath);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { downloadURL, imagePath };
  } catch (error) {
    console.error("Firebase Meal Image Storage Error:", error);
    throw error;
  }
}
