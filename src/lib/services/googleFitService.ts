
import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from "firebase/auth";
import { auth } from "@/lib/firebase";

const fitProvider = new GoogleAuthProvider();
fitProvider.addScope('https://www.googleapis.com/auth/fitness.activity.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.nutrition.read');
fitProvider.setCustomParameters({
  prompt: 'consent',
});

/**
 * Initiates the Google Fit sign-in process to get permissions.
 */
export async function handleGoogleFitSignIn() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated.");
  }
  
  try {
    const result = await signInWithPopup(auth, fitProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential || !credential.accessToken) {
        throw new Error("Could not retrieve access token from Google.");
    }
    
    // You now have the access token. It's automatically managed by Firebase Auth state.
    // The presence of the token with the correct scopes indicates permission.
    
    return true;

  } catch (error: any) {
    console.error("Google Fit Sign-In Error:", error);
    // Handle specific errors, e.g., user closes popup
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Popup closed before completion.");
    }
    throw new Error("Failed to sign in with Google Fit.");
  }
}

/**
 * Checks if the user has already granted Google Fit permissions.
 * Note: This is an indirect check. A more robust solution would involve
 * trying to make a test API call, but that's more complex.
 * For now, we rely on the provider's behavior.
 * This function is not fully reliable and is kept for conceptual demonstration.
 * A better approach is to just try the connection and handle errors.
 */
export async function checkGoogleFitPermission(): Promise<boolean> {
  // This is a placeholder. In a real-world scenario, you would need
  // to manage access tokens and check their scopes. For this app,
  // we'll simplify and re-prompt for consent if an API call fails.
  // We can't truly "check" without making an API call, which is overkill here.
  // The simplest UX is to assume not connected and let the user click the connect button.
  return false; 
}
