
"use client"

import ClientLayout from "../home/layout";

export default function ShoppingListLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ClientLayout>{children}</ClientLayout>
}
