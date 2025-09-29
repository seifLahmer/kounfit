"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuthUser } from "@/hooks/useAuthUser";
import { getUserRole } from "@/lib/services/roleService";
export default function SplashPage() {
  const router = useRouter();
  const { user, loading, error } = useAuthUser(); // Destructure the new error state
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (loading) return; // Wait until loading is false
  
    // If there's an error, don't redirect. The error will be displayed.
    if (error) return;

    const redirectUser = async () => {
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          console.log(role);
  
          switch (role) {
            case "caterer":
              router.replace("/caterer");
              break;
            case "admin":
              router.replace("/admin");
              break;
            case "delivery":
              router.replace("/delivery");
              break;
            case "client":
              router.replace("/home");
              break;
            default:
              router.replace("/welcome");
              break;
          }
        } catch (error) {
          console.error("Erreur récupération rôle :", error);
          router.replace("/welcome");
        }
      } else {
        console.log("time out ");
        const timer = setTimeout(() => {
          router.replace("/welcome");
        }, 4000);
        return () => clearTimeout(timer);
      }
    };
  
    redirectUser();
  }, [user, loading, router, error]); // Add error to the dependency array
  
  // If there's an error, display it
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
        <h1 className="text-lg font-bold text-red-600 mb-4">System Authentication Error</h1>
        <div className="w-full max-w-2xl p-4 bg-gray-100 rounded-lg text-sm text-left whitespace-pre-wrap overflow-auto">
          <pre>{error}</pre>
        </div>
      </div>
    );
  }

  // If we're loading user data or if the user is logged in, show a loading indicator.
  if (loading || user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white overflow-hidden">
            <p>Loading...</p>
        </div>
    );
  }

  // If we're not loading and there's no user, show the splash screen.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white overflow-hidden">
      <motion.div
        className="flex items-center"
        initial={{ y: "50vh", x: "0%", scale: 0.8, opacity: 0 }}
        animate={{
          y: [null, 0, -25, 0, -10, 0],
          x: [null, "-5%", "-5%", "-20%", "-20%", "-20%"],
          scale: [null, 1, 1, 1, 1, 1],
          opacity: [null, 1, 1, 1, 1, 1],
        }}
        transition={{
          duration: 2.5,
          ease: "easeOut",
          times: [0, 0.4, 0.6, 0.8, 0.9, 1],
          delay: 0.2,
        }}
        onAnimationComplete={() => setAnimationComplete(true)}
      >
        {/* Logo K */}
        <motion.div>
          <Image
            src="/k/k green.png"
            alt="Kounfit Logo K"
            width={80}
            height={80}
            priority
          />
        </motion.div>

        {/* Image OUNFIT */}
        <div className="relative overflow-hidden">
          <AnimatePresence>
            {animationComplete && (
              <motion.div
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: "-10px", opacity: 1 }} // petit décalage vers la gauche
                transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
              >
                <Image
                  src="/k/ounfit.png"
                  alt="ounfit"
                  width={80}   // ajuste selon ton image exportée
                  height={80}   // ajuste selon ton image exportée
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}