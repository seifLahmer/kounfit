"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bot,
  BookCopy,
  LayoutDashboard,
  ShoppingCart,
  User,
  Leaf,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "./ui/button"

const links = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/meal-suggestions",
    label: "AI Suggestions",
    icon: Bot,
  },
  {
    href: "/meal-plans",
    label: "Meal Plans",
    icon: BookCopy,
  },
  {
    href: "/shopping-list",
    label: "Shopping List",
    icon: ShoppingCart,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Leaf className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-semibold">NutriTrack</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href} className="w-full">
                <SidebarMenuButton
                  isActive={pathname === link.href}
                  className="w-full justify-start"
                >
                  <link.icon className="h-4 w-4 mr-2" />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <Separator className="my-2" />
        <div className="p-2 rounded-lg bg-secondary">
          <h3 className="font-semibold text-sm">Upgrade to Pro</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Unlock advanced features and get unlimited meal plans.
          </p>
          <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Upgrade</Button>
        </div>
      </SidebarFooter>
    </>
  )
}
