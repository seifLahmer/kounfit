

import * as React from "react"
import { BottomNav } from "@/components/bottom-nav"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav />
    </div>
  )
}
