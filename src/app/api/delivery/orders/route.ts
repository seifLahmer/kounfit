
import { NextRequest, NextResponse } from 'next/server';
import { getMyDeliveries } from '@/lib/services/orderService';
import { headers } from 'next/headers';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DeliveryPerson } from '@/lib/types';


export async function GET(req: NextRequest) {
  try {
    const headersList = headers();
    const userId = headersList.get('X-User-Id');

    if (!userId) {
      return NextResponse.json({ error: 'User information is missing' }, { status: 400 });
    }

    const deliveryPersonRef = doc(db, 'deliveryPeople', userId);
    const deliveryPersonSnap = await getDoc(deliveryPersonRef);

    if (!deliveryPersonSnap.exists() || deliveryPersonSnap.data().status !== 'approved') {
        return NextResponse.json({ error: 'Unauthorized or not approved' }, { status: 403 });
    }

    // Only fetch orders DIRECTLY assigned to this delivery person
    const myDeliveries = await getMyDeliveries(userId);

    return NextResponse.json({ myDeliveries }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/delivery/orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders.', details: error.message }, { status: 500 });
  }
}

    