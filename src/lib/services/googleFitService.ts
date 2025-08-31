
"use client";

import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo, linkWithCredential, User, getIdTokenResult, linkWithPopup, getRedirectResult, AuthErrorCodes, fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

const fitProvider = new GoogleAuthProvider();
// Demander toutes les permissions nécessaires en une seule fois
fitProvider.addScope('https://www.googleapis.com/auth/fitness.activity.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.body.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.nutrition.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.heart_rate.read');
fitProvider.addScope('https://www.googleapis.com/auth/fitness.location.read');

/**
 * Gère la connexion ou la liaison du compte Google de l'utilisateur pour les données Google Fit.
 * Utilise linkWithPopup pour éviter la création de comptes en double.
 * @returns {Promise<boolean>} True si la liaison a réussi.
 */
export async function handleGoogleFitSignIn(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Utilisateur non authentifié.");
  }
  
  try {
    // Tente de lier le compte Google au compte Firebase existant.
    await linkWithPopup(user, fitProvider);
    return true;

  } catch (error: any) {
    // Si le compte est déjà lié, c'est un cas de succès pour nous.
    if (error.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
        return true; 
    }
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      // L'utilisateur a annulé, ce n'est pas une erreur système.
      throw new Error("La fenêtre de connexion a été fermée avant la fin.");
    }
    // Pour les autres erreurs, on les log et on lance une exception.
    console.error("Erreur de connexion/liaison Google Fit:", error);
    throw new Error("Échec de la connexion ou de la liaison avec Google Fit.");
  }
}

/**
 * Vérifie si l'utilisateur a accordé les permissions à Google Fit.
 * @returns {Promise<boolean>} True si le fournisseur Google est lié au compte de l'utilisateur.
 */
export async function checkGoogleFitPermission(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  // Forcer une actualisation des données de l'utilisateur
  await user.reload();
  const freshUser = auth.currentUser;
  if (!freshUser) return false;
  
  // Vérifie si "google.com" fait partie des fournisseurs liés.
  const isGoogleLinked = freshUser.providerData.some(
    (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
  );
  
  return isGoogleLinked;
}

export interface FitData {
  steps: number;
  distance: number; // en mètres
  moveMinutes: number;
  heartPoints: number;
}


/**
 * Récupère les données d'activité complètes pour la journée en cours depuis l'API Google Fit.
 * Cette fonction est entièrement côté client.
 * @returns {Promise<FitData | null>} Un objet avec les pas, distance, minutes d'activité et points cardio, ou null.
 */
export async function fetchTodayFitData(): Promise<FitData | null> {
    const user = auth.currentUser;
    if (!user) return null;

    let oauthAccessToken: string | null = null;
    
    // Tenter de se connecter pour obtenir un token d'accès OAuth
    try {
      const result = await signInWithPopup(auth, fitProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      oauthAccessToken = credential?.accessToken || null;
    } catch (error: any) {
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
             console.error("Erreur lors de l'obtention du token d'accès pour Fit:", error.code);
        }
        return null; // Retourne null si l'utilisateur ferme le popup ou si une erreur survient
    }

    if (!oauthAccessToken) {
        console.log("Impossible d'obtenir le jeton d'accès OAuth de Google.");
        return null;
    }

    // Définir la période pour la journée en cours
    const now = new Date();
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const startTimeMillis = startTime.getTime();
    const endTimeMillis = endTime.getTime();

    // Configuration de la requête pour l'API Fitness
    const fitApiUrl = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate';
    const requestBody = {
        aggregateBy: [
            { dataTypeName: "com.google.step_count.delta", dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps" },
            { dataTypeName: "com.google.distance.delta", dataSourceId: "derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta" },
            { dataTypeName: "com.google.active_minutes", dataSourceId: "derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes" },
            { dataTypeName: "com.google.heart_minutes", dataSourceId: "derived:com.google.heart_minutes:com.google.android.gms:merge_heart_minutes" },
        ],
        bucketByTime: { durationMillis: endTimeMillis - startTimeMillis },
        startTimeMillis: startTimeMillis,
        endTimeMillis: endTimeMillis,
    };

    try {
        const fitResponse = await fetch(fitApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${oauthAccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!fitResponse.ok) {
            const errorText = await fitResponse.text();
            console.error("Erreur de l'API Google Fit:", fitResponse.status, errorText);
            return null;
        }

        const data = await fitResponse.json();
        
        const fitData: FitData = {
            steps: 0,
            distance: 0,
            moveMinutes: 0,
            heartPoints: 0,
        };

        data.bucket[0]?.dataset.forEach((d: any) => {
            if (d.point[0]?.value[0]) {
                const value = d.point[0].value[0];
                if (d.dataSourceId.includes('step_count')) fitData.steps = value.intVal || 0;
                if (d.dataSourceId.includes('distance')) fitData.distance = value.fpVal || 0;
                if (d.dataSourceId.includes('active_minutes')) fitData.moveMinutes = value.intVal || 0;
                if (d.dataSourceId.includes('heart_minutes')) fitData.heartPoints = value.fpVal || 0;
            }
        });

        return fitData;

    } catch (error) {
        console.error("Erreur lors de la récupération des données Google Fit:", error);
        return null;
    }
}
