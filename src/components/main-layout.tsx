import * as React from "react"
import { BottomNav } from "@/components/bottom-nav"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* The main content is now directly the children passed from the protected layout */}
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
