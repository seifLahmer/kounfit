
"use client";

import { useState, useEffect } from 'react';
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
import { ChefHat, Bot, Sparkles, Loader2, Trash2, Plus, CheckCircle } from "lucide-react";
import { analyzeMeal, MealAnalysis } from "@/ai/flows/meal-analysis-flow";
import { addMeal, getMealsByCaterer } from "@/lib/services/mealService";
import type { Meal } from "@/lib/types";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function CatererPage() {
  const [mealDescription, setMealDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysis | null>(null);
  const [catererMeals, setCatererMeals] = useState<Meal[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const { toast } = useToast();

  const fetchMeals = async () => {
    const user = auth.currentUser;
    if (user) {
        try {
            setLoadingMeals(true);
            const meals = await getMealsByCaterer(user.uid);
            setCatererMeals(meals);
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de charger vos repas.", variant: "destructive" });
        } finally {
            setLoadingMeals(false);
        }
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleGenerateMeal = async () => {
      if (!mealDescription) return;
      setIsGenerating(true);
      setAnalysisResult(null);
      try {
        const result = await analyzeMeal({ mealName: mealDescription });
        setAnalysisResult(result);
      } catch (error) {
        console.error("Failed to analyze meal:", error);
        toast({ title: "Erreur d'analyse", description: "L'IA n'a pas pu analyser le repas. Veuillez réessayer.", variant: "destructive" });
      } finally {
        setIsGenerating(false);
      }
  };
  
  const handleIngredientChange = (index: number, field: 'name' | 'grams', value: string | number) => {
    if (!analysisResult) return;
    
    const newIngredients = [...analysisResult.ingredients];
    if(field === 'grams') {
        newIngredients[index] = { ...newIngredients[index], [field]: typeof value === 'number' ? value : parseInt(value, 10) || 0 };
    } else {
        newIngredients[index] = { ...newIngredients[index], [field]: value as string };
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

  const handleSaveMeal = async () => {
      if (!analysisResult || !auth.currentUser) return;
      setIsSaving(true);
      
      const mealData: Omit<Meal, 'id' | 'createdAt'> = {
          name: analysisResult.mealName,
          description: analysisResult.description,
          // You might want to add a category selector in the UI
          category: "lunch",
          imageUrl: `https://placehold.co/600x400.png`, // Placeholder, maybe generate one with AI later
          ingredients: analysisResult.ingredients,
          calories: analysisResult.totalMacros.calories,
          macros: {
              protein: analysisResult.totalMacros.protein,
              carbs: analysisResult.totalMacros.carbs,
              fat: analysisResult.totalMacros.fat,
              fibers: analysisResult.totalMacros.fibers,
          },
          price: 0, // Placeholder, you should add a price field in the UI
          createdBy: auth.currentUser.uid,
          availability: true, // Default to available
      };
      
      try {
          await addMeal(mealData);
          toast({
              title: "Repas Sauvegardé!",
              description: `${mealData.name} a été ajouté à votre liste.`,
              action: <CheckCircle className="text-green-500" />,
          });
          setAnalysisResult(null);
          setMealDescription("");
          fetchMeals(); // Refresh the list of meals
      } catch (error) {
          toast({ title: "Erreur de sauvegarde", description: "Le repas n'a pas pu être sauvegardé.", variant: "destructive" });
      } finally {
          setIsSaving(false);
      }
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
                        <Input 
                            value={analysisResult.mealName}
                            onChange={(e) => setAnalysisResult({...analysisResult, mealName: e.target.value})}
                         />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                            value={analysisResult.description}
                            onChange={(e) => setAnalysisResult({...analysisResult, description: e.target.value})}
                            rows={3}
                        />
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
                    
                    <Button onClick={handleSaveMeal} disabled={isSaving} className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white">
                        {isSaving ? <Loader2 className="mr-2 animate-spin" /> : null}
                        Sauvegarder le repas
                    </Button>
                </CardContent>
              </Card>
            )}


            <Card>
              <CardHeader>
                <CardTitle>Vos repas créés</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Calories</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loadingMeals ? (
                             <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    <Loader2 className="mx-auto animate-spin text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : catererMeals.length > 0 ? (
                            catererMeals.map((meal) => (
                                <TableRow key={meal.id}>
                                    <TableCell>
                                        <Image src={meal.imageUrl} alt={meal.name} width={64} height={64} className="rounded-md" data-ai-hint="caterer meal" />
                                    </TableCell>
                                    <TableCell className="font-medium">{meal.name}</TableCell>
                                    <TableCell>{meal.calories} kcal</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="w-4 h-4 text-destructive"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    Aucun repas n'a encore été créé.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>
              </CardContent>
            </Card>
          </div>
    </div>
  );
}
