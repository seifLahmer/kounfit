
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
import { Sparkles, Bot, ShieldAlert, Trash2, Loader2, Plus, Minus } from "lucide-react";
import { useState } from 'react';
import { analyzeMeal, MealAnalysis } from "@/ai/flows/meal-analysis-flow";

export default function AdminPage() {
  const [mealDescription, setMealDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysis | null>(null);

  const handleGenerateMeal = async () => {
      if (!mealDescription) return;
      setIsGenerating(true);
      setAnalysisResult(null);
      try {
        const result = await analyzeMeal({ mealName: mealDescription });
        setAnalysisResult(result);
      } catch (error) {
        console.error("Failed to analyze meal:", error);
        // You can add a toast notification here to inform the user of the error
      } finally {
        setIsGenerating(false);
      }
  };
  
  const handleIngredientChange = (index: number, field: 'name' | 'grams', value: string) => {
    if (!analysisResult) return;
    
    const newIngredients = [...analysisResult.ingredients];
    if(field === 'grams') {
        newIngredients[index] = { ...newIngredients[index], [field]: parseInt(value, 10) || 0 };
    } else {
        newIngredients[index] = { ...newIngredients[index], [field]: value };
    }

    setAnalysisResult({ ...analysisResult, ingredients: newIngredients });
  };
  
  const addIngredient = () => {
    if (!analysisResult) return;
    const newIngredients = [...analysisResult.ingredients, { name: '', grams: 0 }];
    setAnalysisResult({ ...analysisResult, ingredients: newIngredients });
  };

  const removeIngredient = (index: number) => {
    if (!analysisResult) return;
    const newIngredients = analysisResult.ingredients.filter((_, i) => i !== index);
    setAnalysisResult({ ...analysisResult, ingredients: newIngredients });
  };

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
                  générer une description, une liste d'ingrédients et les macros.
                </p>
                <div>
                  <label
                    htmlFor="meal-description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nom ou description du repas
                  </label>
                  <Textarea
                    id="meal-description"
                    value={mealDescription}
                    onChange={(e) => setMealDescription(e.target.value)}
                    placeholder="Ex: Un plat principal riche en protéines avec du poulet et du riz pour la prise de masse, faible en matières grasses."
                    disabled={isGenerating}
                  />
                </div>
                <Button onClick={handleGenerateMeal} disabled={isGenerating || !mealDescription} className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white">
                  {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                  {isGenerating ? "Analyse en cours..." : "Générer le Repas avec l'IA"}
                </Button>
              </CardContent>
            </Card>

            {isGenerating && (
                <div className="text-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-destructive" />
                    <p className="mt-4 text-muted-foreground">L'IA analyse votre plat...</p>
                </div>
            )}

            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Résultat de l'Analyse IA</CardTitle>
                  <CardDescription>Vérifiez et modifiez les informations ci-dessous avant de sauvegarder le repas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Nom du plat</Label>
                        <Input defaultValue={analysisResult.mealName} />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea defaultValue={analysisResult.description} rows={3}/>
                    </div>

                    <div>
                        <Label className="mb-2 block">Ingrédients Estimés</Label>
                         <div className="space-y-2">
                            {analysisResult.ingredients.map((ing, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input 
                                        value={ing.name} 
                                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                                        className="flex-1"
                                        placeholder="Nom de l'ingrédient"
                                    />
                                    <Input 
                                        type="number" 
                                        value={ing.grams}
                                        onChange={(e) => handleIngredientChange(index, 'grams', e.target.value)}
                                        className="w-24"
                                        placeholder="grammes"
                                    />
                                    <span className="text-sm text-muted-foreground">g</span>
                                    <Button variant="ghost" size="icon" onClick={() => removeIngredient(index)}>
                                        <Trash2 className="w-4 h-4 text-destructive"/>
                                    </Button>
                                </div>
                            ))}
                         </div>
                         <Button variant="outline" size="sm" onClick={addIngredient} className="mt-2">
                            <Plus className="w-4 h-4 mr-2"/> Ajouter un ingrédient
                         </Button>
                    </div>

                    <div>
                        <Label>Macros Totales (calculées)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                            <Card>
                                <CardHeader className="p-4">
                                    <CardDescription>Calories</CardDescription>
                                    <CardTitle>{analysisResult.totalMacros.calories} kcal</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="p-4">
                                    <CardDescription>Protéines</CardDescription>
                                    <CardTitle>{analysisResult.totalMacros.protein} g</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="p-4">
                                    <CardDescription>Glucides</CardDescription>
                                    <CardTitle>{analysisResult.totalMacros.carbs} g</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="p-4">
                                    <CardDescription>Lipides</CardDescription>
                                    <CardTitle>{analysisResult.totalMacros.fat} g</CardTitle>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                    
                    <Button className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white">Sauvegarder le repas</Button>
                </CardContent>
              </Card>
            )}


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
           <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ajouter un composant de base</CardTitle>
                <CardDescription>
                  Ajoutez un ingrédient de base (ex: "Blanc de poulet cuit", "Frites maison"). L'IA trouvera automatiquement ses macros pour 100g.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="component-name">Nom du composant *</Label>
                  <Input id="component-name" placeholder="Ex: Riz blanc cuit" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="component-price">Prix pour 100g (DT) *</Label>
                  <Input id="component-price" type="number" defaultValue="0" />
                </div>
                <Button className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white">
                  <Sparkles className="mr-2" />
                  Ajouter et Obtenir Macros (IA)
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Liste des composants</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="border rounded-md">
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Prix/100g</TableHead>
                        <TableHead>Macros (P/G/L)</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                           Aucun composant n'a encore été ajouté.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
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
