
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Uploads a user's profile image to Firebase Storage.
 * @param uid The user's unique ID.
 * @param file The image file to upload.
 * @returns The public URL of the uploaded image.
 */
export async function uploadProfileImage(uid: string, file: File): Promise<string> {
  // Create a storage reference with a unique path for each user and file
  const storageRef = ref(storage, `profile-images/${uid}/${file.name}`);

  try {
    // Upload the file to the specified path
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL for the uploaded file
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log("File available at", downloadURL);
    return downloadURL;

  } catch (error) {
    console.error("Error uploading profile image:", error);
    // Re-throw the original error to be caught by the calling function
    throw error;
  }
}
