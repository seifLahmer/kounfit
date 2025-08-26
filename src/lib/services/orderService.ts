

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
  getDoc,
  orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Order, User, Meal } from "@/lib/types";
import { createNotification } from "./notificationService";

const ORDERS_COLLECTION = "orders";


type PlaceOrderInput = Omit<Order, 'id' | 'orderDate' | 'deliveryDate' | 'status' | 'catererIds'> & {
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
    // Get unique caterer IDs from the items
    const catererIds = [...new Set(orderData.items.map(item => item.catererId))];

    const orderWithTimestamp = {
      ...orderData,
      status: 'pending' as const,
      orderDate: serverTimestamp(),
      deliveryDate: serverTimestamp(), // Placeholder, can be updated later
      deliveryTime: 35, // Default delivery time, can be updated by caterer
      catererIds: catererIds, // Add the array of caterer IDs
    };

    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderWithTimestamp);
    
    const notificationMessage = `Vous avez une nouvelle commande #${docRef.id.substring(0,5)} de ${orderData.clientName}.`;
    
    // Notify each caterer involved in the order
    for (const catererId of catererIds) {
        await createNotification(catererId, notificationMessage);
    }

    return docRef.id;
  } catch (error) {
    console.error("Error placing order: ", error);
    throw new Error("Could not place the order.");
  }
}

/**
 * Retrieves all orders from the 'orders' collection, sorted by date.
 * @returns A promise that resolves to an array of all orders.
 */
export async function getAllOrders(): Promise<Order[]> {
    try {
        const ordersCollection = collection(db, ORDERS_COLLECTION);
        const q = query(ordersCollection, orderBy("orderDate", "desc"));
        
        const querySnapshot = await getDocs(q);
        
        const orders: Order[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const order: Order = {
                id: docSnap.id,
                ...data,
                orderDate: data.orderDate instanceof Timestamp ? data.orderDate.toDate() : new Date(),
                deliveryDate: data.deliveryDate instanceof Timestamp ? data.deliveryDate.toDate() : new Date(),
            } as Order;
            orders.push(order);
        });
        
        return orders;
    } catch (error) {
        console.error("Error fetching all orders: ", error);
        throw new Error("Could not fetch orders.");
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
        // Query for orders where the 'catererIds' array contains the caterer's ID.
        const q = query(
            ordersCollection, 
            where("catererIds", "array-contains", catererUid)
        );
        
        const querySnapshot = await getDocs(q);
        
        const orders: Order[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const order: Order = {
                id: docSnap.id,
                ...data,
                orderDate: data.orderDate instanceof Timestamp ? data.orderDate.toDate() : new Date(),
                deliveryDate: data.deliveryDate instanceof Timestamp ? data.deliveryDate.toDate() : new Date(),
            } as Order;
            orders.push(order);
        });
        
        // Sort manually after fetching to avoid needing a composite index
        orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());

        return orders;
    } catch (error) {
        console.error("Error fetching orders by caterer: ", error);
        throw new Error("Could not fetch orders.");
    }
}


/**
 * Updates the status of a specific order and notifies the appropriate parties.
 * @param orderId The ID of the order to update.
 * @param status The new status for the order.
 * @param deliveryPersonId Optional. The UID of the delivery person being assigned.
 */
export async function updateOrderStatus(orderId: string, status: Order['status'], deliveryPersonId?: string): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  
  try {
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) {
      throw new Error("Order not found.");
    }

    const orderData = orderSnap.data() as Order;
    
    const updatePayload: any = { status };
    if (status === 'ready_for_delivery' && deliveryPersonId) {
        updatePayload.deliveryPersonId = deliveryPersonId;
    }
    if(status === 'delivered') {
        updatePayload.deliveryDate = serverTimestamp();
    }


    // Update the status in Firestore
    await updateDoc(orderRef, updatePayload);

    // --- Notifications Logic ---
    const statusMessages: { [key in Order['status']]?: string } = {
        in_preparation: "est en cours de préparation",
        ready_for_delivery: "est prête et a été assignée à un livreur.",
        delivered: "a été livrée",
        cancelled: "a été annulée",
    };

    // Notify Client
    if (status in statusMessages) {
        const clientMessage = `Votre commande #${orderId.substring(0, 5)}... ${statusMessages[status]}.`;
        await createNotification(orderData.clientId, clientMessage);
    }
    
    // Notify Delivery Person when assigned
    if (status === 'ready_for_delivery' && deliveryPersonId) {
        const deliveryMessage = `Une nouvelle livraison vous a été assignée : Commande #${orderId.substring(0, 5)}...`;
        await createNotification(deliveryPersonId, deliveryMessage);
    }

  } catch (error) {
    console.error("Error updating order status: ", error);
    throw new Error("Could not update the order status.");
  }
}


/**
 * Retrieves orders assigned to a specific delivery person, filtered by status.
 * @param deliveryPersonId The UID of the delivery person.
 * @param statuses An array of statuses to filter by.
 * @returns A promise that resolves to an array of orders.
 */
export async function getMyDeliveries(deliveryPersonId: string, statuses: Order['status'][]): Promise<Order[]> {
    if (!statuses || statuses.length === 0) {
        return [];
    }
    try {
        const ordersCollection = collection(db, ORDERS_COLLECTION);
        const q = query(
            ordersCollection,
            where("deliveryPersonId", "==", deliveryPersonId),
            where("status", "in", statuses),
        );

        const querySnapshot = await getDocs(q);

        const orders: Order[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            orders.push({
                id: docSnap.id,
                ...data,
                orderDate: data.orderDate instanceof Timestamp ? data.orderDate.toDate() : new Date(),
                deliveryDate: data.deliveryDate instanceof Timestamp ? data.deliveryDate.toDate() : new Date(),
            } as Order);
        });
        
        orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());

        return orders;
    } catch (error) {
        console.error("Error fetching 'my deliveries':", error);
        throw new Error("Could not fetch assigned deliveries.");
    }
}
