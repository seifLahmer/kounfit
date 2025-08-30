
import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo, linkWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";

const fitProvider = new GoogleAuthProvider();
fitProvider.addScope('https://www.googleapis.com/auth/fitness.activity.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.body.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.nutrition.read');

// This forces the consent screen to appear every time, useful for development.
// Remove in production if you want the user to grant permission only once.
// fitProvider.setCustomParameters({
//   prompt: 'consent',
// });

/**
 * Initiates the Google Fit sign-in process to get permissions.
 * It tries to link the Google Fit account if the user is already logged in.
 */
export async function handleGoogleFitSignIn() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated.");
  }
  
  try {
    const result = await linkWithCredential(user, fitProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential || !credential.accessToken) {
        throw new Error("Could not retrieve access token from Google.");
    }
    
    return true;

  } catch (error: any) {
    console.error("Google Fit Sign-In Error:", error);
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Popup closed before completion.");
    } else if (error.code === 'auth/credential-already-in-use') {
        // This case means the account is already linked. It's a success.
        console.log("Google Fit account already linked.");
        return true;
    }
    throw new Error("Failed to sign in with Google Fit.");
  }
}

/**
 * Checks if the user has granted Google Fit permissions.
 * This function relies on the auth state and is a simplified check.
 */
export async function checkGoogleFitPermission(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  
  // Check if the Google provider is linked
  const isGoogleLinked = user.providerData.some(
    (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
  );
  
  return isGoogleLinked;
}

/**
 * Fetches the total step count for the current day from the Google Fit API.
 * @returns {Promise<number | null>} The total step count, or null if an error occurs.
 */
export async function fetchTodayStepCount(): Promise<number | null> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated to fetch Fit data.");
    }

    // Get the OAuth access token from the user's credentials
    const idTokenResult = await user.getIdTokenResult();
    const accessToken = idTokenResult.token; // This is the Firebase ID token, not the OAuth token. Mistake.
    
    // The client-side SDK doesn't easily expose the OAuth access token after the initial sign-in.
    // The most robust way is via a backend, but for a pure client-side PoC, we can re-authenticate silently
    // or try to get it from the initial sign-in. For now, let's assume we need to re-auth to get a fresh token.

    const reauthResult = await signInWithPopup(auth, fitProvider);
    const credential = GoogleAuthProvider.credentialFromResult(reauthResult);
    if (!credential?.accessToken) {
        throw new Error("Could not get Google Fit access token.");
    }
    const oauthAccessToken = credential.accessToken;

    const today = new Date();
    const startTimeMillis = new Date(today.setHours(0, 0, 0, 0)).getTime();
    const endTimeMillis = new Date(today.setHours(23, 59, 59, 999)).getTime();

    const requestBody = {
        aggregateBy: [{
            dataTypeName: "com.google.step_count.delta",
            dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
        }],
        bucketByTime: { durationMillis: 86400000 }, // 1 day
        startTimeMillis: startTimeMillis,
        endTimeMillis: endTimeMillis,
    };

    try {
        const response = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${oauthAccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error.status === 'PERMISSION_DENIED') {
                 throw new Error("Google Fit permission denied. Please reconnect from your profile.");
            }
            throw new Error(`Google Fit API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.bucket && data.bucket.length > 0) {
            const bucket = data.bucket[0];
            if (bucket.dataset && bucket.dataset.length > 0) {
                const dataset = bucket.dataset[0];
                if (dataset.point && dataset.point.length > 0) {
                    const point = dataset.point[0];
                    if (point.value && point.value.length > 0) {
                        return point.value[0].intVal || 0;
                    }
                }
            }
        }
        
        return 0; // No steps recorded for the day

    } catch (error) {
        console.error("Error fetching step count:", error);
        throw error; // Re-throw to be caught by the calling function
    }
}
