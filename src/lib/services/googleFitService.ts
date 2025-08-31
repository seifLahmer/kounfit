
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
    if (error.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
        return true; 
    }
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      throw new Error("La fenêtre de connexion a été fermée avant la fin.");
    }
    console.error("Google Fit Sign-In/Link Error:", error.code);
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

  await user.reload();
  const freshUser = auth.currentUser;
  if (!freshUser) return false;
  
  return freshUser.providerData.some(
    (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
  );
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
 * NOTE: Cette fonction est un stub et nécessite une implémentation backend sécurisée
 * pour gérer les jetons d'accès OAuth en production de manière fiable.
 * @returns {Promise<FitData | null>} Un objet avec les pas, distance, minutes d'activité et points cardio, ou null.
 */
export async function fetchTodayFitData(): Promise<FitData | null> {
    const user = auth.currentUser;
    if (!user) return null;

    // Pour une application de production robuste, la gestion des jetons d'accès
    // devrait se faire côté serveur pour des raisons de sécurité.
    // La récupération directe du jeton d'accès côté client est complexe et
    // sujette à des problèmes de sécurité et d'expiration.
    // En attendant une telle implémentation, cette fonction ne récupérera pas de données
    // pour éviter des erreurs complexes et des popups inattendus.
    
    // Si l'application était dotée d'un backend, nous appellerions ici
    // une fonction côté serveur qui utiliserait un jeton de rafraîchissement stocké
    // pour obtenir un nouveau jeton d'accès et interroger l'API Google Fit.
    // Exemple : const fitData = await fetch('/api/fit-data');
    
    console.log("La récupération des données Google Fit nécessite une implémentation backend sécurisée pour être pleinement fonctionnelle.");

    return null;
}
