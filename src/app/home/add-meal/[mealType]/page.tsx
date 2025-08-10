
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Loader2, Plus, Search, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAvailableMealsByCategory } from "@/lib/services/mealService";
import type { Meal } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type DailyPlan = {
    breakfast: Meal | null;
    lunch: Meal | null;
    snack: Meal | null;
    dinner: Meal | null;
};

const mealTypeTranslations: { [key: string]: string } = {
  breakfast: 'Petit déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snack: 'Collation'
};

export default function AddMealPage() {
  const router = useRouter();
  const params = useParams();
  const mealType = (Array.isArray(params.mealType) ? params.mealType[0] : params.mealType) as keyof DailyPlan;

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!mealType) return;
    
    const fetchMeals = async () => {
      try {
        setLoading(true);
        const fetchedMeals = await getAvailableMealsByCategory(mealType);
        setMeals(fetchedMeals);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les repas disponibles.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, [mealType, toast]);
  
  const handleAddMeal = (meal: Meal) => {
    try {
      const savedData = localStorage.getItem("dailyPlanData");
      const todayStr = new Date().toISOString().split('T')[0];
      
      let currentPlan: DailyPlan;
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.date === todayStr) {
          currentPlan = parsedData.plan;
        } else {
          currentPlan = { breakfast: null, lunch: null, snack: null, dinner: null };
        }
      } else {
        currentPlan = { breakfast: null, lunch: null, snack: null, dinner: null };
      }
      
      // Use the category from the meal object, or the mealType from the URL as a fallback.
      const targetMealType = meal.category as keyof DailyPlan || mealType;
      
      if(currentPlan[targetMealType] === null) {
        currentPlan[targetMealType] = meal;
      } else {
        toast({
          title: "Attention",
          description: `Vous avez déjà un ${mealTypeTranslations[targetMealType]} prévu.`,
          variant: "default"
        });
        return;
      }
      
      localStorage.setItem("dailyPlanData", JSON.stringify({ date: todayStr, plan: currentPlan }));
      
      router.push('/home');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le repas au plan.",
        variant: "destructive",
      });
      console.error("Failed to update localStorage", error);
    }
  };

  const filteredMeals = useMemo(() => {
    return meals.filter(meal => 
      meal.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [meals, searchTerm]);


  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 space-y-4 sticky top-0 bg-background z-10 border-b">
         <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                <ChevronLeft />
            </Button>
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={`Rechercher un ${mealTypeTranslations[mealType] || 'repas'}...`}
                    className="pl-10 h-12 rounded-full bg-muted border-transparent focus-visible:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : filteredMeals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredMeals.map((meal) => (
                    <Card key={meal.id} className="overflow-hidden rounded-2xl border shadow-sm flex flex-col">
                        <Link href={`/home/meal/${meal.id}`} className="block relative h-40">
                           <Image
                                src={meal.imageUrl}
                                alt={meal.name}
                                layout="fill"
                                objectFit="cover"
                                className="w-full h-full"
                                data-ai-hint="healthy food"
                            />
                        </Link>
                        <CardContent className="p-4 bg-brand-teal text-white flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-xl truncate">{meal.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Leaf className="w-4 h-4 text-green-300" />
                                    <span className="font-medium">{meal.calories} kcal</span>
                                </div>
                                 <div className="flex items-center gap-4 text-sm mt-2 text-green-200">
                                    <span>P {meal.macros.protein}g</span>
                                    <span>C {meal.macros.carbs}g</span>
                                    <span>L {meal.macros.fat}g</span>
                                </div>
                            </div>
                            <div className="flex justify-end mt-2">
                                <Button size="icon" className="bg-destructive hover:bg-destructive/80 rounded-full h-10 w-10 shrink-0" onClick={() => handleAddMeal(meal)}>
                                    <Plus className="w-6 h-6"/>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
             <div className="text-center text-muted-foreground py-16">
                <p className="font-semibold text-lg">Aucun repas trouvé</p>
                <p>Aucun repas n'est disponible pour cette catégorie ou votre recherche.</p>
            </div>
        )}
      </main>
    </div>
  );
}
