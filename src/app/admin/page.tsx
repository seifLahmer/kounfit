
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-red-600">
          Panneau d'Administration
        </h1>
      </header>

      <Tabs defaultValue="traiteurs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="traiteurs">Gestion des Traiteurs</TabsTrigger>
          <TabsTrigger value="commandes">Gestion des Commandes</TabsTrigger>
        </TabsList>
        <TabsContent value="traiteurs">
           <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ajouter un nouveau traiteur</CardTitle>
                <CardDescription>
                  Créez un profil pour un utilisateur traiteur.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Action Manuelle Requise</AlertTitle>
                  <AlertDescription>
                    Pour des raisons de sécurité, vous devez d'abord créer le compte du
                    traiteur dans la console Firebase Authentication (avec un email/mot de
                    passe), puis copier son UID et le coller dans le champ ci-dessous.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="caterer-uid">UID du Traiteur (Firebase Auth)</Label>
                  <Input id="caterer-uid" placeholder="Copiez l'UID depuis la console Firebase" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caterer-name">Nom Complet</Label>
                  <Input id="caterer-name" placeholder="Ex: Jean Traiteur" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="caterer-email">Email du Traiteur</Label>
                  <Input id="caterer-email" placeholder="Ex: traiteur@exemple.com" />
                </div>
                <Button className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white">
                  Ajouter le Traiteur
                </Button>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle>Liste des Traiteurs</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="border rounded-md">
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                          Aucun traiteur n'a encore été ajouté.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="commandes">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Commandes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Visualisez et filtrez toutes les commandes des clients.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrer par région</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les régions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les régions</SelectItem>
                    <SelectItem value="tunis">Tunis</SelectItem>
                    <SelectItem value="ariana">Ariana</SelectItem>
                    <SelectItem value="ben arous">Ben Arous</SelectItem>
                    <SelectItem value="manouba">La Manouba</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Région</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                        Aucune commande trouvée pour cette région
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
