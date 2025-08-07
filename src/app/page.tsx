"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf } from 'lucide-react';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to the welcome page
    router.replace('/welcome');
  }, [router]);

  // Render a simple loading/splash screen while redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Leaf className="w-24 h-24 text-primary animate-pulse" />
      <h1 className="text-4xl font-bold mt-4">FITHELATH</h1>
    </div>
  );
}
