
"use client"

import ClientLayout from "../home/layout";

export default function MealPlansLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ClientLayout>{children}</ClientLayout>
}
