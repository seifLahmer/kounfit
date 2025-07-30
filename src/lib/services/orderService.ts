

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  writeBatch,
  updateDoc,
  getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Order, User, Meal } from "@/lib/types";
import { createNotification } from "./notificationService";

const ORDERS_COLLECTION = "orders";


type PlaceOrderInput = Omit<Order, 'id' | 'orderDate' | 'deliveryDate' | 'status'> & {
  items: Array<{
    mealId: string;
    mealName: string;
    quantity: number;
    unitPrice: number;
    catererId: string; // Ensure catererId is included for each item
  }>;
};

/**
 * Creates a new order in the Firestore 'orders' collection.
 * @param orderData The order data to save.
 * @returns The ID of the newly created order document.
 */
export async function placeOrder(orderData: PlaceOrderInput): Promise<string> {
  try {
    const orderWithTimestamp = {
      ...orderData,
      status: 'pending' as const,
      orderDate: serverTimestamp(),
      deliveryDate: serverTimestamp(), // Placeholder, can be updated later
    };

    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error("Error placing order: ", error);
    throw new Error("Could not place the order.");
  }
}

/**
 * Retrieves all orders containing at least one meal created by a specific caterer.
 * @param catererUid The UID of the caterer.
 * @returns A promise that resolves to an array of orders.
 */
export async function getOrdersByCaterer(catererUid: string): Promise<Order[]> {
    try {
        const ordersCollection = collection(db, ORDERS_COLLECTION);
        // Query for orders where the 'items' array contains an object with the caterer's ID.
        const q = query(ordersCollection, where("items", "array-contains-any", 
            (await getDocs(query(collection(db, 'meals'), where('createdBy', '==', catererUid))))
            .docs.map(doc => ({ mealId: doc.id }))
        ));
        
        // This is a simplified query. Firestore cannot query inside array objects deeply.
        // The correct approach is to have a 'catererIds' field in the order document.
        // Let's get all orders and filter them on the client-side as a workaround.
        // This is NOT efficient for large datasets but works for this project's scale.

        const querySnapshot = await getDocs(collection(db, ORDERS_COLLECTION));
        
        const orders: Order[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const orderItems = data.items as PlaceOrderInput['items'];

            // Check if any item in the order was created by this caterer
            if (orderItems.some(item => item.catererId === catererUid)) {
                 const order: Order = {
                    id: docSnap.id,
                    ...data,
                    orderDate: data.orderDate instanceof Timestamp ? data.orderDate.toDate() : new Date(),
                    deliveryDate: data.deliveryDate instanceof Timestamp ? data.deliveryDate.toDate() : new Date(),
                } as Order;
                orders.push(order);
            }
        });
        
        // Sort orders by date, newest first
        orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
        
        return orders;
    } catch (error) {
        console.error("Error fetching orders by caterer: ", error);
        throw new Error("Could not fetch orders.");
    }
}


/**
 * Updates the status of a specific order and notifies the client.
 * @param orderId The ID of the order to update.
 * @param status The new status for the order.
 */
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  
  try {
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) {
      throw new Error("Order not found.");
    }

    const orderData = orderSnap.data() as Order;
    
    // Update the status in Firestore
    await updateDoc(orderRef, { status });

    // Create a notification for the client
    const statusMessages = {
        pending: "est en attente de confirmation",
        in_preparation: "est en cours de préparation",
        delivered: "a été livrée",
        cancelled: "a été annulée",
    };
    
    const message = `Votre commande #${orderId.substring(0, 5)}... ${statusMessages[status]}.`;
    await createNotification(orderData.clientId, message);

  } catch (error) {
    console.error("Error updating order status: ", error);
    throw new Error("Could not update the order status.");
  }
}
