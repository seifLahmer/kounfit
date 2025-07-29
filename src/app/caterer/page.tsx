
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChefHat, Bot, Sparkles, Loader2, Trash2, Plus } from "lucide-react";
import { analyzeMeal, MealAnalysis } from "@/ai/flows/meal-analysis-flow";


export default function CatererPage() {
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
        <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
          <ChefHat className="w-8 h-8" />
          Tableau de Bord Traiteur
        </h1>
      </header>

      <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-6 h-6" />
                  Créer un Repas avec l'IA
                </CardTitle>
                <CardDescription>
                  Décrivez le repas que vous souhaitez créer. L'IA se chargera de
                  générer une description, une liste d'ingrédients et les macros.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    placeholder="Ex: Couscous au poulet"
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
                <CardTitle>Vos repas créés</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Aucun repas n'a encore été créé.
                </p>
              </CardContent>
            </Card>
          </div>
    </div>
  );
}
