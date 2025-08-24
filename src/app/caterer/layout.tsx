
"use client";

import { Utensils, Loader2, LogOut, BarChart2, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserRole } from "@/lib/services/roleService";
import { cn } from "@/lib/utils";
import { doc, getDoc } from "firebase/firestore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CatererLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          if (role === 'caterer') {
              const catererDocRef = doc(db, 'caterers', user.uid);
              const catererSnap = await getDoc(catererDocRef);
              if(catererSnap.exists() && catererSnap.data().status === 'approved') {
                  setIsAuthorized(true);
              } else {
                  router.replace('/login');
              }
          } else {
              router.replace('/login');
          }
        } catch (error) {
            console.error("Caterer layout auth error:", error);
            router.replace('/login');
        } finally {
            setIsLoading(false);
        }
      } else {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);
  
  const handleLogout = async () => {
    await auth.signOut();
    router.push('/welcome');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const navLinks = [
    { href: "/caterer/profile", label: "Profil", icon: User },
    { href: "/caterer", label: "Dashboard", icon: Utensils },
    { href: "/caterer/stats", label: "Stats", icon: BarChart2 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFFFF]">
      <main className="flex-1 pb-24">{children}</main>
      <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
         <div className="relative flex justify-around items-center h-16 bg-white/70 backdrop-blur-md rounded-full shadow-lg border border-white/30">
            {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/caterer" && pathname.startsWith(link.href));
                return (
                    <Link key={link.href} href={link.href} className="flex-1 flex justify-center items-center h-full">
                         <div className={cn(
                            "flex flex-col items-center justify-center gap-1 transition-colors",
                            isActive ? "text-primary" : "text-gray-400 hover:text-primary"
                        )}>
                            <link.icon className="h-6 w-6" />
                        </div>
                    </Link>
                )
            })}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex-1 flex justify-center items-center h-full text-gray-400 hover:text-primary">
                    <div className="flex flex-col items-center justify-center gap-1 transition-colors">
                        <LogOut className="h-6 w-6" />
                    </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr de vouloir vous déconnecter ?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                    Déconnexion
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </nav>
    </div>
  );
}
