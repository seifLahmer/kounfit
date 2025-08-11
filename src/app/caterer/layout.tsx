
"use client";

import { Home, BarChart2, PlusCircle, User, Settings, Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserRole } from "@/lib/services/roleService";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/caterer", icon: Home, label: "Accueil" },
    { href: "/caterer/stats", icon: BarChart2, label: "Stats" },
    { href: "/caterer/add-meal", icon: PlusCircle, label: "Ajouter" },
    { href: "/caterer/profile", icon: User, label: "Profil" },
    { href: "/caterer/settings", icon: Settings, label: "Ajustes" },
]

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
          if (role !== 'caterer') {
             router.replace('/login');
             return;
          } else {
            setIsAuthorized(true);
          }
        } catch (error) {
           console.error("Error verifying caterer role:", error);
           router.replace('/login');
           return;
        } finally {
            setIsLoading(false);
        }
      } else {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

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
  
  const handleLogout = async () => {
    await auth.signOut();
    router.push('/welcome');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-20">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around items-center h-16">
          {navLinks.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} className={cn("flex flex-col items-center gap-1 w-16", isActive ? "text-primary" : "text-gray-500")}>
                <Icon />
                <span className="text-xs">{label}</span>
              </Link>
            )
          })}
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-gray-500 w-16">
             <LogOut />
             <span className="text-xs">Déconn.</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
