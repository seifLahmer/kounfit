"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to the welcome page
    router.replace('/welcome');
  }, [router]);

  // Render a simple loading/splash screen while redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="w-24 h-24 text-primary animate-spin" />
    </div>
  );
}
