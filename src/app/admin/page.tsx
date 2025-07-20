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
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Bot, ShieldAlert } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-red-600">
          Panneau d'Administration
        </h1>
      </header>

      <Tabs defaultValue="repas" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="repas">Gestion des Repas</TabsTrigger>
          <TabsTrigger value="composants">Gestion des Composants</TabsTrigger>
          <TabsTrigger value="traiteurs">Gestion des Traiteurs</TabsTrigger>
          <TabsTrigger value="commandes">Gestion des Commandes</TabsTrigger>
        </TabsList>
        <TabsContent value="repas">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-6 h-6" />
                  Créer un Repas avec l'IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Décrivez le repas que vous souhaitez créer. L'IA se chargera de
                  générer un nom, une catégorie et une liste d'ingrédients
                  optimisée à partir de votre bibliothèque de composants.
                </p>
                <div>
                  <label
                    htmlFor="meal-description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description du repas souhaité
                  </label>
                  <Textarea
                    id="meal-description"
                    placeholder="Ex: Un plat principal riche en protéines avec du poulet et du riz pour la prise de masse, faible en matières grasses."
                  />
                </div>
                <Button className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white">
                  <Sparkles className="mr-2" />
                  Générer le Repas avec l'IA
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Liste des repas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Aucun repas n'a encore été créé.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="composants">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Composants</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Le contenu pour la gestion des composants sera bientôt disponible.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="traiteurs">
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
            </CardContent>
          </Card>
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
