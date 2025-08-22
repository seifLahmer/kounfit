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
      const handleWidth = 56; // h-14 is 56px
      const travelDistance = railWidth - handleWidth;
      if (info.offset.x > travelDistance * 0.8) {
        setIsUnlocked(true);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-1 relative">
        <Image
          src="/welcome.png"
          alt="Bol de nourriture saine avec quinoa, pois chiches, concombre et tomates"
          layout="fill"
          objectFit="cover"
          className="z-0"
          data-ai-hint="healthy food bowl"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10"></div>
      </div>
      <div className="bg-white p-8 pt-6 flex flex-col items-center text-center rounded-t-3xl shadow-lg -mt-10 z-20">
        <h1 className="text-4xl font-bold text-gray-800 font-heading">kounfit</h1>
        <p className="text-2xl font-semibold text-gray-700 mt-2 mb-8">
          Mangez sain, vivez mieux
        </p>
        
        <div className="w-full max-w-sm h-28 flex items-center justify-center">
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
                    className="relative w-full h-16 bg-gray-100 rounded-full flex items-center p-1"
                >
                    <motion.div
                    drag="x"
                    dragConstraints={constraintsRef}
                    dragElastic={0.1}
                    onDragEnd={handleDragEnd}
                    className="w-14 h-14 bg-gradient-to-br from-secondary to-red-400 rounded-full flex items-center justify-center cursor-pointer shadow-md"
                    whileTap={{ scale: 1.1, cursor: "grabbing" }}
                    >
                    <ChevronRight className="text-white h-8 w-8" />
                    </motion.div>
                    <span className="absolute left-1/2 -translate-x-1/2 text-gray-500 font-semibold pointer-events-none">
                    Commencer
                    </span>
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
      </div>
    </div>
  );
}
