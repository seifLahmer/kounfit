
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

  // Create a storage reference with a unique path for each user's profile image.
  // Using a consistent file name like 'profile.jpg' can simplify things,
  // but using the original file name is also fine.
  const storageRef = ref(storage, `profile-images/${uid}/${file.name}`);

  try {
    // 'file' comes from the file input field
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the public URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;

  } catch (error) {
    console.error("Firebase Storage Error:", error);
    // Re-throw the error to be handled by the component
    // This allows us to show a specific message to the user
    throw error;
  }
}
