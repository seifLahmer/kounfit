import { Utensils, LogOut } from "lucide-react";
import Link from "next/link";

export default function CatererLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 pb-20">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around items-center h-16">
          <Link href="/caterer" className="flex flex-col items-center gap-1 text-red-500">
            <Utensils />
            <span className="text-xs">Dashboard</span>
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
