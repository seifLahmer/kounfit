
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
    }, 4000); // Increased duration to accommodate the new animation sequence

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white overflow-hidden">
      <motion.div
        className="flex items-center"
        initial={{ y: "50vh", x: "20%", scale: 0.8, opacity: 0 }} // Start off-screen at the bottom, shifted right
        animate={{
          y: [null, "0vh", "0vh", "0vh", "0vh"],      // Jump to center-y
          x: [null, "20%", "20%", "0%", "0%"],      // Stay right-shifted then move to center
          scale: [null, 1, 1, 1, 1],                  // Scale up to 1
          opacity: [null, 1, 1, 1, 1]                 // Become visible
        }}
        transition={{
          duration: 2.5,
          ease: "easeOut",
          times: [0, 0.4, 0.7, 0.9, 1], // Timing for each keyframe
          delay: 0.2
        }}
      >
        <motion.div
            // This inner div handles the bounce on the y-axis
            animate={{
              y: [null, 0, -25, 0, -10, 0]
            }}
            transition={{
              duration: 1.2,
              ease: "easeInOut",
              delay: 1.0, // Start bouncing after it arrives at the center
              times: [0, 0.4, 0.6, 0.8, 0.9, 1]
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
                    animate={{ x: "0%", opacity: 1 }}
                    transition={{ delay: 2.8, duration: 0.5, ease: "easeOut" }}
                >
                    <span className="text-6xl font-bold text-[#0B7E58]">ounfit</span>
                </motion.div>
            </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
