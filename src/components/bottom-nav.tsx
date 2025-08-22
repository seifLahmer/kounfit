
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

const links = [
  { href: "/home", label: "Accueil", icon: Home },
  { href: "/meal-plans", label: "Favoris", icon: Heart },
  { href: "/shopping-list", label: "Panier", icon: ShoppingCart },
  { href: "/profile", label: "Profil", icon: User },
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr de vouloir vous déconnecter ?</AlertDialogTitle>
              <AlertDialogDescription>
                Vous devrez vous reconnecter pour accéder à nouveau à votre compte.
              </AlertDialogDescription>
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
  )
}
