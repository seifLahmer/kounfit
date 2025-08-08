
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  User,
  Heart,
  LayoutGrid,
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
  { href: "/profile", label: "Profile", icon: User },
  { href: "/meal-plans", label: "Favourites", icon: Heart },
  { href: "/home", label: "Home", icon: LayoutGrid },
  { href: "/shopping-list", label: "Cart", icon: ShoppingCart },
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
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = pathname === link.href
          const isHome = link.label === "Home"

          return (
            <Link key={link.href} href={link.href} className="flex-1 flex justify-center items-center h-full">
              <div className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors relative h-full w-full",
                   isActive && !isHome ? "text-red-500" : "text-muted-foreground hover:text-red-500"
              )}>
                {isHome ? (
                  <div className={cn(
                    "absolute -top-6 p-4 rounded-full text-white shadow-lg flex items-center justify-center bg-red-500"
                    )}>
                    <link.icon className="h-6 w-6" />
                  </div>
                ) : (
                  <link.icon className="h-6 w-6" />
                )}
                <span className={cn("text-xs capitalize", isHome ? "mt-12" : "")}>
                  {link.label}
                </span>
              </div>
            </Link>
          )
        })}
        <AlertDialog>
          <AlertDialogTrigger asChild>
             <button className="flex-1 flex justify-center items-center h-full text-muted-foreground hover:text-red-500">
                <div className="flex flex-col items-center justify-center gap-1 transition-colors relative h-full w-full">
                    <LogOut className="h-6 w-6" />
                    <span className="text-xs capitalize">Logout</span>
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
