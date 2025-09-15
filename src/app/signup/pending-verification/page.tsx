'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { auth } from '@/lib/firebase';

export default function PendingVerificationPage() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(interval);
          router.replace('/home');
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 text-center">
        <h1 className="text-3xl font-bold">Validez votre adresse e-mail</h1>
        <p className="text-muted-foreground">
          Nous vous avons envoyé un e-mail de validation. Veuillez consulter votre boîte de réception et cliquer sur le lien pour activer votre compte.
        </p>
        <p className="text-sm text-muted-foreground">
          La page sera rechargée automatiquement une fois que vous aurez validé votre e-mail.
        </p>
        <Button onClick={() => router.push('/login')}>Retour à la connexion</Button>
      </div>
    </div>
  );
}
