
"use client";

import { GoogleAuthProvider, linkWithCredential, User, signInWithRedirect } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthErrorCodes } from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication, User as CapacitorFirebaseUser } from '@capacitor-firebase/authentication';


const fitProvider = new GoogleAuthProvider();
fitProvider.addScope('https://www.googleapis.com/auth/fitness.activity.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.body.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.nutrition.read');


/**
 * Handles signing in or linking the user's Google account for Google Fit data.
 * Uses linkWithPopup to avoid creating duplicate accounts.
 * @returns {Promise<boolean>} True if the link was successful or already existed.
 */
export async function handleGoogleFitSignIn(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated.");
  }
  
  try {
     if (Capacitor.isNativePlatform()) {
        const result = await FirebaseAuthentication.signInWithGoogle();
        const credential = GoogleAuthProvider.credential(result.credential?.idToken);
        if (credential) {
          await linkWithCredential(user, credential);
        }
    } else {
        await signInWithRedirect(auth, fitProvider);
    }
    return true;

  } catch (error: any) {
    if (error.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
        console.log("Google Fit account already linked.");
        return true; // This is a success case for our purpose
    }
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      throw new Error("The sign-in window was closed before completing.");
    }
    console.error("Google Fit Sign-In/Link Error:", error);
    throw new Error("Failed to sign in or link with Google Fit.");
  }
}

/**
 * Checks if the user has granted Google Fit permissions.
 * @returns {Promise<boolean>} True if the Google provider is linked to the user's account.
 */
export async function checkGoogleFitPermission(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  // Reload the user to ensure providerData is up to date.
  await user.reload();
  const freshUser = auth.currentUser;
  if (!freshUser) return false;
  
  // Check if the user's provider data includes Google.
  return freshUser.providerData.some(
    (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
  );
}

export interface FitData {
  steps: number;
  distance: number; // in meters
  moveMinutes: number;
  heartPoints: number;
}


/**
 * Fetches today's activity data from the Google Fit API.
 * This function is a placeholder for a future secure backend implementation.
 * Direct client-side token management for this API is complex and insecure.
 * Therefore, this function currently returns null.
 * @returns {Promise<FitData | null>}
 */
export async function fetchTodayFitData(): Promise<FitData | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    // In a production application, fetching Fit data requires a secure server-side
    // implementation to handle OAuth access tokens safely.
    // The previous attempts to do this on the client-side were unstable.
    // To ensure app stability, this function will not fetch data for now.
    // This avoids silent failures and user confusion.
    console.log("Google Fit data fetching requires a secure backend implementation to be fully functional. Returning null.");

    return null;
}
