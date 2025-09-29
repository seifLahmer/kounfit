// notificationService.ts

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Notification } from "@/lib/types";

const NOTIFICATIONS_COLLECTION = "notifications";

/**
 * Crée une nouvelle notification pour un utilisateur.
 * @param userId L'UID de l'utilisateur qui doit recevoir la notification.
 * @param message Le contenu de la notification.
 * @returns L'ID de la notification créée.
 */
export async function createNotification(
  userId: string,
  message: string
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      userId,
      message,
      createdAt: serverTimestamp(),
      read: false,
      readAt: null, // On stockera la date où elle est lue
    });
    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création de la notification :", error);
    throw new Error("Impossible de créer la notification.");
  }
}

/**
 * Récupère toutes les notifications non lues d’un utilisateur.
 * @param userId L’UID de l’utilisateur.
 * @returns Un tableau de notifications non lues.
 */
export async function getUserNotifications(
  userId: string
): Promise<Notification[]> {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      where("read", "==", false),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      notifications.push({
        id: docSnap.id,
        ...data,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date(),
      } as Notification);
    });

    return notifications;
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications :", error);
    throw new Error("Impossible de récupérer les notifications.");
  }
}

/**
 * Marque toutes les notifications d’un utilisateur comme lues.
 * @param userId L’UID de l’utilisateur.
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      where("read", "==", false)
    );

    const querySnapshot = await getDocs(q);

    for (const docSnap of querySnapshot.docs) {
      const notifRef = doc(db, NOTIFICATIONS_COLLECTION, docSnap.id);
      await updateDoc(notifRef, {
        read: true,
        readAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Erreur lors du marquage des notifications :", error);
    throw new Error("Impossible de marquer les notifications comme lues.");
  }
}

/**
 * Supprime toutes les notifications lues qui ont plus de 24h.
 */
export async function cleanupOldNotifications(): Promise<void> {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(notificationsRef, where("read", "==", true));

    const querySnapshot = await getDocs(q);
    const now = Date.now();

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      if (data.readAt instanceof Timestamp) {
        const readAt = data.readAt.toDate().getTime();
        if (now - readAt >= 24 * 60 * 60 * 1000) {
          await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, docSnap.id));
        }
      }
    }
  } catch (error) {
    console.error("Erreur lors du nettoyage des notifications :", error);
    throw new Error("Impossible de nettoyer les anciennes notifications.");
  }
}
