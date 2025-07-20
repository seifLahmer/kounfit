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
  { href: "/meal-plans", label: "Plans", icon: Heart },
  { href: "/home", label: "Home", icon: LayoutGrid },
  { href: "/shopping-list", label: "Cart", icon: ShoppingCart },
  { href: "/logout", label: "Logout", icon: LogOut },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLogoutAlertOpen, setIsLogoutAlertOpen] = React.useState(false)

  const handleLogoutClick = (e: React.MouseEvent, href: string) => {
    if (href === "/logout") {
      e.preventDefault()
      setIsLogoutAlertOpen(true)
    }
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
            const isLogout = link.label === "Logout"

            const linkContent = (
              <div className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors relative h-full w-full",
                   isActive && !isHome ? "text-accent" : "text-muted-foreground hover:text-primary"
              )}>
                {isHome ? (
                  <div className={cn(
                    "absolute -top-6 p-4 rounded-full text-accent-foreground shadow-lg flex items-center justify-center",
                    isActive ? "bg-accent" : "bg-gray-400"
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
            );

            if (isLogout) {
                return (
                    <div key={link.href} className="flex-1 flex justify-center items-center h-full" onClick={(e: any) => handleLogoutClick(e, link.href)}>
                        {linkContent}
                    </div>
                )
            }

            return (
              <Link key={link.href} href={link.href} className="flex-1 flex justify-center items-center h-full">
                {linkContent}
              </Link>
            )
          })}
        </div>
      </nav>

      <AlertDialog open={isLogoutAlertOpen} onOpenChange={setIsLogoutAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be returned to the welcome screen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-col-reverse gap-2">
            <AlertDialogCancel asChild>
                <Button variant="outline" className="w-full">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
                <Button className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleLogoutConfirm}>Log Out</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
