
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Uploads a user's profile image to Firebase Storage.
 * @param uid The user's unique ID.
 * @param file The image file to upload.
 * @returns The public URL of the uploaded image.
 */
export async function uploadProfileImage(uid: string, file: File): Promise<string> {
  // Create a storage reference
  const storageRef = ref(storage, `profile-images/${uid}/${file.name}`);

  try {
    // Upload the file to the specified path
    const snapshot = await uploadBytes(storageRef, file);
    console.log("Uploaded a blob or file!", snapshot);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("File available at", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw new Error("Could not upload profile image.");
  }
}
