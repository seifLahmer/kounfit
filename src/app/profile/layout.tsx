
"use client"

import ClientLayout from "../home/layout";

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ClientLayout>{children}</ClientLayout>
}
