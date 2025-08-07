
"use client";

import { Shield, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserRole } from "@/lib/services/roleService";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Wait for a moment to ensure all redirect logic has time to settle
          await new Promise(resolve => setTimeout(resolve, 50)); 
          const role = await getUserRole(user.uid);
          if (role === 'admin') {
            setAuthStatus("authorized");
          } else {
            setAuthStatus("unauthorized");
            router.replace('/welcome');
          }
        } catch (error) {
           console.error("Error verifying admin role:", error);
           setAuthStatus("unauthorized");
           router.replace('/welcome');
        }
      } else {
        setAuthStatus("unauthorized");
        router.replace('/welcome');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (authStatus !== "authorized") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-red-500" />
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 pb-20">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around items-center h-16">
          <Link href="/admin" className="flex flex-col items-center gap-1 text-red-500">
            <Shield />
            <span className="text-xs">Admin</span>
          </Link>
          <Link href="/welcome" className="flex flex-col items-center gap-1 text-gray-600">
            <LogOut />
            <span className="text-xs">Logout</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
