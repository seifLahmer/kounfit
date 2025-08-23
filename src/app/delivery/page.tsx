
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Map } from "lucide-react";

export default function DeliveryDashboardPage() {
    return (
        <div className="p-4 space-y-6">
             <header className="p-4 flex justify-between items-center bg-primary text-white rounded-lg">
                <h1 className="text-2xl font-bold font-heading">Interface Livreur</h1>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>En attente de commandes...</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Map className="w-16 h-16 mb-4"/>
                    <p>La carte des livraisons s'affichera ici.</p>
                </CardContent>
            </Card>
        </div>
    )
}
