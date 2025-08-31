
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG!)),
  });
}

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const userId = decodedToken.uid;
        
        const userRecord = await getAuth().getUser(userId);

        const googleProviderInfo = userRecord.providerData.find(
            (p) => p.providerId === 'google.com'
        );

        if (!googleProviderInfo) {
             return NextResponse.json({ error: 'User is not linked with Google' }, { status: 403 });
        }

        // We can't get the user's access token directly from Firebase Admin.
        // The scopes must be requested on the client and the client must send the access token.
        // This is a limitation of this architecture.
        // A full backend solution would store refresh tokens.
        // For this demo, we will rely on a short-lived token passed from the client,
        // which is not ideal but works for this context.
        // The most robust solution would involve a full OAuth2 flow handled by the backend.
        
        // Since we can't get the access token, we can't make the call to Google Fit API here.
        // The logic in `fetchTodayFitData` on the client needs to be updated to make the call
        // itself, after getting permission. This route can't fulfill its purpose without
        // a significant backend architecture change (storing refresh tokens).
        // The client-side approach has been rewritten to be more robust.
        // This file is now redundant but kept to explain the architecture choice.

        return NextResponse.json({ 
            error: 'This server-side endpoint is not implemented due to OAuth2 token complexities. The client now handles the Fit API call directly after ensuring permissions.' 
        }, { status: 501 });

    } catch (error) {
        console.error('Error in /api/fit:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
