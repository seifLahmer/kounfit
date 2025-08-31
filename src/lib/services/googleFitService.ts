
import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo, linkWithCredential, User, getIdTokenResult } from "firebase/auth";
import { auth } from "@/lib/firebase";

const fitProvider = new GoogleAuthProvider();
fitProvider.addScope('https://www.googleapis.com/auth/fitness.activity.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.body.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.nutrition.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.heart_rate.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.location.read');


export async function handleGoogleFitSignIn(): Promise<boolean> {
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
    
    // If the user is new to this provider, link it to the existing account
    const additionalUserInfo = getAdditionalUserInfo(result);
    if (additionalUserInfo?.isNewUser) {
        await linkWithCredential(user, credential);
    }
    
    return true;

  } catch (error: any) {
    console.error("Google Fit Sign-In Error:", error);
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Popup closed before completion.");
    } else if (error.code === 'auth/credential-already-in-use') {
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
        const idTokenResult = await getIdTokenResult(user, true);
        const providerData = user.providerData.find(p => p.providerId === 'google.com');

        if (providerData) {
            // This is a simplification. In a real-world scenario with long-lived sessions,
            // you'd need to handle token refresh securely on a backend.
            // For this client-side example, we'll re-authenticate silently if needed.
            // A more robust solution involves a backend to exchange the auth code for a refresh token.
            const result = await signInWithPopup(auth, fitProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            return credential?.accessToken || null;
        }
        return null;
    } catch (error: any) {
        if(error.code === 'auth/popup-blocked') {
            console.error("Popup blocked. Cannot refresh token without user interaction.");
            return null; // Can't get token without user interaction
        }
        console.error("Could not get access token", error);
        throw error;
    }
}


/**
 * Fetches comprehensive activity data for the current day from the Google Fit API.
 * @returns {Promise<FitData | null>} An object with steps, distance, moveMinutes, and heartPoints, or null.
 */
export async function fetchTodayFitData(): Promise<FitData | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const idTokenResult = await getIdTokenResult(user, true);
    // signInWithPopup is necessary to get a fresh OAuth access token.
    const result = await signInWithPopup(auth, fitProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const oauthAccessToken = credential?.accessToken;

    if (!oauthAccessToken) {
        console.log("OAuth Access Token for Google Fit is not available.");
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
