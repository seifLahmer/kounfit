
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function WelcomePage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: any, info: any) => {
    if (constraintsRef.current) {
      const railWidth = constraintsRef.current.offsetWidth;
      const handleWidth = 140; 
      const travelDistance = railWidth - handleWidth;
      if (info.offset.x > travelDistance * 0.8) {
        setIsUnlocked(true);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden">
        {/* Animated Image */}
        <motion.div
            className="relative w-full h-1/2 flex items-center justify-center"
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "circOut" }}
        >
            <Image
                src="/repas-welcome.png"
                alt="Bol de nourriture saine"
                width={500}
                height={500}
                className="max-w-md w-full h-auto"
                data-ai-hint="healthy food bowl"
                priority
            />
        </motion.div>

        {/* Animated Content */}
        <motion.div 
            className="flex-1 flex flex-col items-center justify-start text-center p-8 pt-4"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "circOut", delay: 0.3 }}
        >
            <Image src="/kounfit/kounfit black.png" alt="Kounfit Logo" width={180} height={45} />
            <p className="text-2xl font-semibold text-gray-700 -mt-2 mb-4">
            Mangez sain, vivez mieux
            </p>
            
            <div className="w-full max-w-sm h-28 flex items-center justify-center mt-4">
                <AnimatePresence>
                {!isUnlocked ? (
                    <motion.div
                    key="slider"
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                    >
                    <div
                        ref={constraintsRef}
                        className="relative w-full h-16 bg-black/10 backdrop-blur-sm border border-black/5 rounded-full flex items-center p-1"
                    >
                        <motion.div
                            drag="x"
                            dragConstraints={constraintsRef}
                            dragElastic={0.1}
                            onDragEnd={handleDragEnd}
                            className="bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-md px-6 py-4"
                            whileTap={{ scale: 1.05, cursor: "grabbing" }}
                        >
                            <span className="font-semibold text-white text-lg whitespace-nowrap">Get Started</span>
                        </motion.div>
                        
                        <div className="absolute right-6 flex items-center gap-1 pointer-events-none">
                            <motion.div initial={{ opacity: 0.3 }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}>
                                <ChevronRight className="text-black/50 h-5 w-5" />
                            </motion.div>
                            <motion.div initial={{ opacity: 0.3 }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}>
                                <ChevronRight className="text-black/50 h-5 w-5" />
                            </motion.div>
                            <motion.div initial={{ opacity: 0.3 }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}>
                                <ChevronRight className="text-black/50 h-5 w-5" />
                            </motion.div>
                        </div>
                    </div>
                    </motion.div>
                ) : (
                    <motion.div
                    key="buttons"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full space-y-3"
                    >
                    <Button asChild size="lg" className="w-full h-14 text-lg font-semibold rounded-button bg-primary hover:bg-primary/90">
                        <Link href="/login">Se connecter</Link>
                    </Button>
                    <Button asChild size="lg" className="w-full h-14 text-lg font-semibold rounded-button bg-secondary hover:bg-secondary/90">
                        <Link href="/signup">S'inscrire</Link>
                    </Button>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </motion.div>
    </div>
  );
}
