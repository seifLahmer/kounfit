
import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo, linkWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";

const fitProvider = new GoogleAuthProvider();
fitProvider.addScope('https://www.googleapis.com/auth/fitness.activity.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.body.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.nutrition.read');


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

/**
 * Fetches the total step count for the current day from the Google Fit API.
 * @returns {Promise<number | null>} The total step count, or null if an error occurs.
 */
export async function fetchTodayStepCount(): Promise<number | null> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated to fetch Fit data.");
    }

    let oauthAccessToken: string | null = null;
    
    try {
        const reauthResult = await signInWithPopup(auth, fitProvider);
        const credential = GoogleAuthProvider.credentialFromResult(reauthResult);
        if (credential?.accessToken) {
            oauthAccessToken = credential.accessToken;
        }
    } catch(error: any) {
        if(error.code === 'auth/credential-already-in-use') {
            console.warn("Credential in use, but this may be okay. Trying to proceed.");
             const googleUser = auth.currentUser?.providerData.find(p => p.providerId === GoogleAuthProvider.PROVIDER_ID);
             if(!googleUser) {
                 throw new Error("Could not get Google Fit access token even after re-auth attempt.");
             }
             // Re-authenticating to get a fresh token might be needed if it's expired.
             const freshResult = await signInWithPopup(auth, fitProvider);
             const freshCredential = GoogleAuthProvider.credentialFromResult(freshResult);
             if(freshCredential?.accessToken) {
                 oauthAccessToken = freshCredential.accessToken;
             }
        } else {
             throw new Error("Could not get Google Fit access token.");
        }
    }


    if (!oauthAccessToken) {
        throw new Error("OAuth Access Token for Google Fit is not available.");
    }

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
