
"use client";

import { Utensils, Loader2, LogOut, BarChart2, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { cn } from "@/lib/utils";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";
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
import Image from "next/image";

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
    let profileUnsubscribe: Unsubscribe | undefined;
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (profileUnsubscribe) profileUnsubscribe();

      if (user) {
        setIsLoading(true);
        profileUnsubscribe = onSnapshot(doc(db, 'caterers', user.uid), (docSnap) => {
          if (docSnap.exists() && docSnap.data().status === 'approved') {
            setIsAuthorized(true);
          } else {
            // If not approved, just block access. 
            // The login page is responsible for redirecting to the correct page (e.g., pending-approval).
            // This prevents a redirect loop.
            setIsAuthorized(false);
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Caterer auth listener error:", error);
          setIsAuthorized(false);
          setIsLoading(false);
        });
      } else {
        setIsAuthorized(false);
        setIsLoading(false);
        router.replace('/login');
      }
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
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
    // Render nothing, or a generic "Not Authorized" page if you have one.
    // This prevents the layout from showing and stops the redirect loop.
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
              <AlertDialogContent className="w-11/12 max-w-sm rounded-3xl bg-white">
                <AlertDialogHeader className="text-center space-y-4">
                  <Image src="/kounfit/kounfit black.png" alt="Kounfit Logo" width={100} height={25} className="mx-auto" />
                  <AlertDialogTitle className="text-2xl font-bold">Déconnexion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir vous déconnecter ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col-reverse sm:flex-col-reverse gap-2">
                  <AlertDialogCancel className="w-full h-12 rounded-full border-gray-300">Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="w-full h-12 rounded-full bg-secondary hover:bg-secondary/90">
                    Déconnexion
                  </AlertDialogAction>
                </AlertDialogFooter>
                 <p className="text-center text-sm text-muted-foreground mt-4">À bientôt sur Kounfit !</p>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </nav>
    </div>
  );
}
