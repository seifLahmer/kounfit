"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Bot } from "lucide-react";

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
              <CardTitle>Gestion des Traiteurs</CardTitle>
            </CardHeader>
            <CardContent>
               <p>Le contenu pour la gestion des traiteurs sera bientôt disponible.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="commandes">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Commandes</CardTitle>
            </CardHeader>
            <CardContent>
               <p>Le contenu pour la gestion des commandes sera bientôt disponible.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
