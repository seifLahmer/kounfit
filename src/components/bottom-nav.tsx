
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  User,
  Heart,
  Home,
  ShoppingCart,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
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
} from "@/components/ui/alert-dialog"
import Image from "next/image"

const links = [
  { href: "/profile", label: "Profil", icon: User },
  { href: "/meal-plans", label: "Favoris", icon: Heart },
  { href: "/home", label: "Accueil", icon: Home },
  { href: "/shopping-list", label: "Panier", icon: ShoppingCart },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/welcome');
      toast({ title: 'Déconnexion réussie' });
    } catch (error) {
      toast({ title: 'Erreur de déconnexion', variant: 'destructive' });
    }
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="relative flex justify-around items-center h-16 bg-white/70 backdrop-blur-md rounded-full shadow-lg border border-white/30">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/home" && pathname.startsWith(link.href))
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
           <AlertDialogContent className="w-11/12 max-w-sm rounded-3xl">
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
  )
}
