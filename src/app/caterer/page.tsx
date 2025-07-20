"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChefHat } from "lucide-react";

export default function CatererPage() {
  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
          <ChefHat className="w-8 h-8" />
          Tableau de Bord
        </h1>
        <div className="flex gap-2">
          <Button variant="outline">Aujourd'hui</Button>
          <Button variant="ghost">Ce Mois-ci</Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Commandes à Produire</CardTitle>
          <CardDescription>
            Cliquez sur une commande pour voir les détails et changer le statut.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    Aucune commande à afficher.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
