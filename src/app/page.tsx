"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect immediately to the welcome page
    router.replace('/welcome');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary">
       <Loader2 className="h-12 w-12 animate-spin text-white" />
    </div>
  );
}
