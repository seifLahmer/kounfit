
import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo, linkWithCredential, User, getIdTokenResult, linkWithPopup, getRedirectResult, AuthErrorCodes, fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

const fitProvider = new GoogleAuthProvider();
fitProvider.addScope('https://www.googleapis.com/auth/fitness.activity.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.body.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.nutrition.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.heart_rate.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.location.read');

/**
 * Handles signing in or linking the user's Google account for Google Fit data.
 * It uses linkWithPopup to avoid creating duplicate accounts.
 * @returns {Promise<boolean>} True if the linking was successful.
 */
export async function handleGoogleFitSignIn(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated.");
  }
  
  try {
    await linkWithPopup(user, fitProvider);
    return true;

  } catch (error: any) {
    console.error("Google Fit Sign-In/Link Error:", error.code);
    if (error.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
        console.log("Google Fit account already linked.");
        return true; // This is a success case for our purpose
    }
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Popup closed before completion.");
    }
    throw new Error("Failed to sign in or link with Google Fit.");
  }
}

/**
 * Checks if the user has granted Google Fit permissions by verifying if the Google provider is linked.
 * @returns {Promise<boolean>} True if Google provider is linked to the current user's account.
 */
export async function checkGoogleFitPermission(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  await user.reload();
  const freshUser = auth.currentUser;
  if (!freshUser) return false;
  
  const isGoogleLinked = freshUser.providerData.some(
    (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
  );
  
  return isGoogleLinked;
}

export interface FitData {
  steps: number;
  distance: number; // in meters
  moveMinutes: number;
  heartPoints: number;
}


/**
 * Fetches comprehensive activity data for the current day from our own API endpoint.
 * This function NO LONGER triggers a sign-in flow. It assumes permissions are granted.
 * @returns {Promise<FitData | null>} An object with steps, distance, moveMinutes, and heartPoints, or null.
 */
export async function fetchTodayFitData(): Promise<FitData | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/fit', {
            headers: {
                'Authorization': `Bearer ${idToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to fetch from /api/fit", errorData);
            return null;
        }

        const data: FitData = await response.json();
        return data;
    } catch (error) {
        console.error("Error calling /api/fit endpoint:", error);
        return null;
    }
}
