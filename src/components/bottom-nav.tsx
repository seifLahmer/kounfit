
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  User,
  Heart,
  LayoutGrid,
  ShoppingCart,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button"

const links = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/meal-plans", label: "favourites", icon: Heart },
  { href: "/home", label: "Home", icon: LayoutGrid },
  { href: "/shopping-list", label: "Cart", icon: ShoppingCart },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLogoutAlertOpen, setIsLogoutAlertOpen] = React.useState(false)

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLogoutAlertOpen(true)
  }

  const handleLogoutConfirm = () => {
    console.log("Logging out...")
    setIsLogoutAlertOpen(false)
    router.push('/welcome')
  }

  return (
    <>
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
           <div className="flex-1 flex justify-center items-center h-full cursor-pointer" onClick={handleLogoutClick}>
                <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-red-500">
                    <LogOut className="h-6 w-6" />
                    <span className="text-xs capitalize">Logout</span>
                </div>
            </div>
        </div>
      </nav>

      <AlertDialog open={isLogoutAlertOpen} onOpenChange={setIsLogoutAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir vous déconnecter?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous serez redirigé vers l'écran de bienvenue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:gap-2">
            <AlertDialogCancel asChild>
                <Button variant="outline" className="w-full">Annuler</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
                <Button className="w-full" onClick={handleLogoutConfirm} variant="destructive">Se déconnecter</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
