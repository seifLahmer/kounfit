"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { LeafPattern } from '@/components/icons'; // Assuming you have a cool leaf/logo icon

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    // Wait for a bit before redirecting to show off the splash screen
    const timer = setTimeout(() => {
      router.replace('/welcome');
    }, 1500); 

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary">
       <h1 className="text-6xl font-extrabold text-white font-heading z-10">
          Kounfit
       </h1>
    </div>
  );
}
