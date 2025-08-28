
"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function SplashPage() {
  const router = useRouter();
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/welcome');
    }, 4000); 

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white overflow-hidden">
      <motion.div
        className="flex items-center"
        initial={{ y: "50vh", x: "0%", scale: 0.8, opacity: 0 }} 
        animate={{
          y: [null, 0, -25, 0, -10, 0],      
          x: [null, "-5%", "-5%", "-20%", "-20%", "-20%"],      
          scale: [null, 1, 1, 1, 1, 1],                  
          opacity: [null, 1, 1, 1, 1, 1]                 
        }}
        transition={{
          duration: 2.5,
          ease: "easeOut",
          times: [0, 0.4, 0.6, 0.8, 0.9, 1], 
          delay: 0.2
        }}
        onAnimationComplete={() => setAnimationComplete(true)}
      >
        <motion.div>
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
                {animationComplete && (
                    <motion.div
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{ x: "0%", opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                    >
                        <span className="text-6xl font-bold text-[#0B7E58]">ounfit</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
