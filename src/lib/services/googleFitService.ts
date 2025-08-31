
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
    // Use linkWithPopup to add the Google provider to the existing user account.
    await linkWithPopup(user, fitProvider);
    return true;

  } catch (error: any) {
    console.error("Google Fit Sign-In/Link Error:", error);
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Popup closed before completion.");
    } else if (error.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
        // This means the Google account is already linked to this user or another user.
        // For this flow, we can consider it a success as the credential exists.
        console.log("Google Fit account already linked.");
        return true;
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

  // It's possible for user.providerData to be stale immediately after linking.
  // Reload the user to get the freshest data.
  await user.reload();
  const freshUser = auth.currentUser;
  if (!freshUser) return false;
  
  // Check if the Google provider is linked in the refreshed user data.
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


async function getFitAccessToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        const result = await getRedirectResult(auth);
        if (result) {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential?.accessToken) {
                return credential.accessToken;
            }
        }

        // We can't reliably get the access token on the client side without triggering a popup
        // which is a bad UX. We return null and let the data fetching function handle it.
        return null;

    } catch (error) {
        console.error("Could not get access token for Fit API", error);
        return null;
    }
}


/**
 * Fetches comprehensive activity data for the current day from the Google Fit API.
 * This function NO LONGER triggers a sign-in flow. It assumes permissions are granted.
 * @returns {Promise<FitData | null>} An object with steps, distance, moveMinutes, and heartPoints, or null.
 */
export async function fetchTodayFitData(): Promise<FitData | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    let oauthAccessToken: string | null = await getFitAccessToken();

    if (!oauthAccessToken) {
        try {
            // This is a workaround for client-side token management. It's not ideal.
            // A backend-based token exchange would be more robust.
            const result = await getRedirectResult(auth);
            if (result) {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                oauthAccessToken = credential?.accessToken || null;
            }
        } catch (error: any) {
            if (error.code !== 'auth/no-redirect-operation') {
                console.error("Error getting access token for Fit:", error.code);
            }
             // This is expected if the user closes the popup. We can ignore it here.
            if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
              return null;
            }
        }
    }


    if (!oauthAccessToken) {
        // We cannot fetch data without a token. Return null and let UI handle it.
        return null;
    }


    const today = new Date();
    const startTimeMillis = new Date(today.setHours(0, 0, 0, 0)).getTime();
    const endTimeMillis = new Date(today.setHours(23, 59, 59, 999)).getTime();

    const requestBody = {
        aggregateBy: [
            { dataTypeName: "com.google.step_count.delta", dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps" },
            { dataTypeName: "com.google.distance.delta", dataSourceId: "derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta" },
            { dataTypeName: "com.google.active_minutes", dataSourceId: "derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes" },
            { dataTypeName: "com.google.heart_minutes", dataSourceId: "derived:com.google.heart_minutes:com.google.android.gms:merge_heart_minutes" }
        ],
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
        const fitData: FitData = { steps: 0, distance: 0, moveMinutes: 0, heartPoints: 0 };
        
        if (data.bucket && data.bucket.length > 0) {
           data.bucket[0].dataset.forEach((dataset: any) => {
               if (dataset.point && dataset.point.length > 0) {
                   const point = dataset.point[0];
                   const value = point.value[0].fpVal ?? point.value[0].intVal ?? 0;
                   if(dataset.dataSourceId.includes('step_count')) fitData.steps = value;
                   if(dataset.dataSourceId.includes('distance')) fitData.distance = value;
                   if(dataset.dataSourceId.includes('active_minutes')) fitData.moveMinutes = value;
                   if(dataset.dataSourceId.includes('heart_minutes')) fitData.heartPoints = value;
               }
           });
        }
        
        return fitData;

    } catch (error) {
        console.error("Error fetching google fit data:", error);
        throw error; // Re-throw to be caught by the calling function
    }
}
