
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Notification } from '@/lib/types';

const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Creates a new notification for a user.
 * @param userId The UID of the user to notify.
 * @param message The notification message.
 */
export async function createNotification(userId: string, message: string): Promise<void> {
  try {
    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      userId,
      message,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating notification: ', error);
    // We don't throw here to avoid breaking the calling function (e.g., order update)
  }
}

/**
 * Retrieves the most recent notifications for a user.
 * @param userId The UID of the user.
 * @returns A promise that resolves to an array of notifications.
 */
export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    const notificationsCollection = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(
      notificationsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      } as Notification);
    });

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications: ', error);
    throw new Error('Could not fetch notifications.');
  }
}

/**
 * Marks a specific notification as read.
 * @param notificationId The ID of the notification to update.
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, { isRead: true });
  } catch (error) {
    console.error('Error marking notification as read: ', error);
    throw new Error('Could not update the notification.');
  }
}
