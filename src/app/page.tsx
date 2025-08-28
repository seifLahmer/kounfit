
"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/welcome');
    }, 3000); // Total animation duration + a small buffer

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white overflow-hidden">
      <motion.div
        className="flex items-center"
        initial={{ y: "50vh", x: 0, scale: 0.8 }} // Start from bottom
        animate={{ y: 0, x: "-20%", scale: 1 }} // Move to middle-left
        transition={{
          type: "spring",
          damping: 8,
          stiffness: 80,
          mass: 0.8,
          delay: 0.5,
          restDelta: 0.001
        }}
      >
        <motion.div
            // This inner div handles the bounce without affecting the final position
            animate={{
              y: [0, -30, 0, -15, 0] // Bouncing effect
            }}
            transition={{
              duration: 1,
              ease: "easeInOut",
              delay: 1.2, // Start bouncing after it arrives
              times: [0, 0.3, 0.6, 0.8, 1]
            }}
        >
            <Image 
              src="/k/k green.png" 
              alt="Kounfit Logo K" 
              width={80} 
              height={80}
              priority
            />
        </motion.div>
        
        <div className="relative overflow-hidden">
             <AnimatePresence>
                <motion.div
                    initial={{ x: "-100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 2.2, duration: 0.5, ease: "easeOut" }}
                >
                    <span className="text-6xl font-bold text-[#0B7E58]">ounfit</span>
                </motion.div>
            </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
