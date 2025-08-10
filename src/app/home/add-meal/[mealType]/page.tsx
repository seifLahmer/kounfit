
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Loader2, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAvailableMealsByCategory } from "@/lib/services/mealService";
import type { Meal } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type DailyPlan = {
    breakfast: Meal | null;
    lunch: Meal | null;
    snack: Meal | null;
    dinner: Meal | null;
};

const mealTypeTranslations: { [key: string]: string } = {
  breakfast: 'un petit-déjeuner',
  lunch: 'un déjeuner',
  dinner: 'un dîner',
  snack: 'une collation'
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
    if (mealType) {
      const fetchMeals = async () => {
        try {
          setLoading(true);
          const fetchedMeals = await getAvailableMealsByCategory(mealType as Meal['category']);
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
    }
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
      
      currentPlan[mealType] = meal;
      
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

  const filteredMeals = meals.filter((meal) =>
    meal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft />
        </Button>
        <h1 className="text-xl font-bold capitalize">
            Ajouter {mealTypeTranslations[mealType] || 'un repas'}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Rechercher un plat..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : filteredMeals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredMeals.map((meal) => (
                    <Card key={meal.id} className="overflow-hidden group">
                         <div className="relative">
                            <Image
                                src={meal.imageUrl}
                                alt={meal.name}
                                width={400}
                                height={200}
                                className="object-cover w-full h-40"
                                data-ai-hint="healthy food"
                            />
                             <Button size="icon" className="absolute top-2 right-2 bg-primary/80 hover:bg-primary rounded-full h-9 w-9" onClick={() => handleAddMeal(meal)}>
                                <PlusCircle className="w-5 h-5"/>
                             </Button>
                        </div>
                        <CardHeader>
                            <CardTitle className="text-base truncate">{meal.name}</CardTitle>
                            <CardDescription>{meal.calories} kcal</CardDescription>
                        </CardHeader>
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
