
import { NextRequest, NextResponse } from 'next/server';
import { getReadyForDeliveryOrders } from '@/lib/services/orderService';
import { headers } from 'next/headers';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DeliveryPerson } from '@/lib/types';


export async function GET(req: NextRequest) {
  try {
    // We can't use Firebase Auth on the server-side in the same way,
    // so we'll pass the user's ID and region from the client for verification.
    // In a production app, you would use a more secure method like session tokens.
    const headersList = headers();
    const userId = headersList.get('X-User-Id');
    const userRegion = headersList.get('X-User-Region');

    if (!userId || !userRegion) {
      return NextResponse.json({ error: 'User information is missing' }, { status: 400 });
    }

    // Optional: Verify the user is a valid, approved delivery person on the server
    const deliveryPersonRef = doc(db, 'deliveryPeople', userId);
    const deliveryPersonSnap = await getDoc(deliveryPersonRef);

    if (!deliveryPersonSnap.exists() || deliveryPersonSnap.data().status !== 'approved') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const orders = await getReadyForDeliveryOrders(userRegion);

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Error in /api/delivery/orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders.' }, { status: 500 });
  }
}
