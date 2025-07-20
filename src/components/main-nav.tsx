"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Heart,
  User,
  ShoppingCart,
  LogOut
} from "lucide-react"

import { cn } from "@/lib/utils"

const links = [
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
  {
    href: "/favourites",
    label: "favourites",
    icon: Heart,
  },
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/shopping-list",
    label: "Cart",
    icon: ShoppingCart,
  },
  {
    href: "/logout",
    label: "Logout",
    icon: LogOut,
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = link.href === "/" ? pathname === link.href : pathname.startsWith(link.href)
          const isHome = link.label === "Home"

          return (
            <Link key={link.href} href={link.href} className="flex-1 flex justify-center items-center">
                <div className={cn(
                    "flex flex-col items-center gap-1 transition-colors",
                    isActive ? "text-red-500" : "text-gray-500 hover:text-red-500",
                    isHome && "relative"
                )}>
                  {isHome ? (
                    <div className="absolute -top-8 bg-red-500 p-4 rounded-full text-white shadow-lg">
                      <link.icon className="h-6 w-6" />
                    </div>
                  ) : (
                    <link.icon className="h-6 w-6" />
                  )}
                  <span className={cn("text-xs", isHome && "mt-12")}>{link.label}</span>
                </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}