
import { NextRequest, NextResponse } from 'next/server';
import { getReadyForDeliveryOrders, getMyDeliveries } from '@/lib/services/orderService';
import { headers } from 'next/headers';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DeliveryPerson } from '@/lib/types';


export async function GET(req: NextRequest) {
  try {
    const headersList = headers();
    const userId = headersList.get('X-User-Id');
    const userRegion = headersList.get('X-User-Region');

    if (!userId || !userRegion) {
      return NextResponse.json({ error: 'User information is missing' }, { status: 400 });
    }

    const deliveryPersonRef = doc(db, 'deliveryPeople', userId);
    const deliveryPersonSnap = await getDoc(deliveryPersonRef);

    if (!deliveryPersonSnap.exists() || deliveryPersonSnap.data().status !== 'approved') {
        return NextResponse.json({ error: 'Unauthorized or not approved' }, { status: 403 });
    }

    const [availableOrders, myDeliveries] = await Promise.all([
        getReadyForDeliveryOrders(userRegion),
        getMyDeliveries(userId)
    ]);

    return NextResponse.json({ availableOrders, myDeliveries }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/delivery/orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders.', details: error.message }, { status: 500 });
  }
}
