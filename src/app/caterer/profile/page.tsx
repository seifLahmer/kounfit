
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat } from "lucide-react";

export default function CatererProfilePage() {
  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center gap-4">
        <ChefHat className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-gray-800">
          Profil du Traiteur
        </h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Vos Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cette page affichera les détails de votre profil de traiteur.
            La fonctionnalité est en cours de développement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
