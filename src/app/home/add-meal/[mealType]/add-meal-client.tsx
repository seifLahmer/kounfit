
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Loader2, Plus, Search, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAvailableMealsByCategory } from "@/lib/services/mealService";
import { toggleFavoriteMeal } from "@/lib/services/userService";
import { auth } from "@/lib/firebase";
import type { Meal, DailyPlan, User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { getUserProfile } from "@/lib/services/userService";
import { cn } from "@/lib/utils";
import { CalorieIcon } from "@/components/icons";

const mealTypeTranslations: { [key: string]: string } = {
  breakfast: 'Petit déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snack: 'Collation'
};

export default function AddMealClientPage() {
  const router = useRouter();
  const params = useParams();
  const mealType = (Array.isArray(params.mealType) ? params.mealType[0] : params.mealType) as keyof DailyPlan;

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [favoriteMealIds, setFavoriteMealIds] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const fetchInitialData = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
        router.push('/login');
        return;
    }
    setLoading(true);
    try {
        const [fetchedMeals, userProfile] = await Promise.all([
            getAvailableMealsByCategory(mealType),
            getUserProfile(firebaseUser.uid)
        ]);
        setMeals(fetchedMeals);
        if (userProfile) {
            setUser(userProfile);
            setFavoriteMealIds(userProfile.favoriteMealIds || []);
        }
    } catch (error) {
        toast({
            title: "Erreur",
            description: "Impossible de charger les données initiales.",
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  }, [mealType, router, toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  
  const handleAddMeal = (meal: Meal) => {
    try {
      const savedData = localStorage.getItem("dailyPlanData");
      const todayStr = new Date().toISOString().split('T')[0];
      
      let currentPlan: DailyPlan;
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const plan = (parsedData.date === todayStr) ? parsedData.plan : {};
        currentPlan = {
          breakfast: Array.isArray(plan.breakfast) ? plan.breakfast : [],
          lunch: Array.isArray(plan.lunch) ? plan.lunch : [],
          snack: Array.isArray(plan.snack) ? plan.snack : [],
          dinner: Array.isArray(plan.dinner) ? plan.dinner : [],
        };
      } else {
        currentPlan = { breakfast: [], lunch: [], snack: [], dinner: [] };
      }
      
      const targetMealType = meal.category;
      
      if (!Array.isArray(currentPlan[targetMealType])) {
          currentPlan[targetMealType] = [];
      }
      currentPlan[targetMealType].push(meal);
      
      localStorage.setItem("dailyPlanData", JSON.stringify({ date: todayStr, plan: currentPlan }));
      
      toast({
          title: "Repas ajouté !",
          description: `${meal.name} a été ajouté à votre plan.`
      })
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

  const handleToggleFavorite = async (mealId: string) => {
    if (!user) return;
    try {
        const updatedFavorites = await toggleFavoriteMeal(user.uid, mealId);
        setFavoriteMealIds(updatedFavorites);
        const isFavorite = updatedFavorites.includes(mealId);
        toast({
            title: isFavorite ? "Ajouté aux favoris" : "Retiré des favoris",
            description: `Le repas a été ${isFavorite ? 'ajouté à' : 'retiré de'} vos favoris.`
        });
        if (isFavorite) {
          router.push('/meal-plans');
        }
    } catch (error) {
        toast({
            title: "Erreur",
            description: "Impossible de mettre à jour les favoris.",
            variant: "destructive",
        });
    }
  };

  const filteredMeals = useMemo(() => {
    return meals.filter(meal => 
      meal.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [meals, searchTerm]);


  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#a2fcdc] to-background">
      <header className="p-4 space-y-4 sticky top-0 bg-transparent z-10">
         <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                <ChevronLeft />
            </Button>
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={`Rechercher un ${mealTypeTranslations[mealType] || 'repas'}...`}
                    className="pl-10 h-12 rounded-button bg-gray-50 border-gray-200 focus:bg-white"
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
            <div className="grid grid-cols-2 gap-4">
                {filteredMeals.map((meal) => (
                    <Card key={meal.id} className="relative overflow-hidden rounded-2xl border shadow-sm h-56 group">
                        <Link href={`/home/meal/${meal.id}`} className="absolute inset-0 z-0">
                           <Image
                                src={meal.imageUrl}
                                alt={meal.name}
                                layout="fill"
                                objectFit="cover"
                                className="w-full h-full transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint="healthy food"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        </Link>
                        
                        <CardContent className="relative z-10 p-3 flex flex-col justify-end h-full text-white">
                            <div>
                                <h3 className="font-bold text-base truncate">{meal.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <CalorieIcon className="w-3 h-3 text-primary" />
                                    <span className="font-medium text-sm">{meal.calories} kcal</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs mt-1">
                                    <span className="font-semibold text-protein">P</span><span>{meal.macros.protein}g</span>
                                    <span className="font-semibold text-primary">C</span><span>{meal.macros.carbs}g</span>
                                    <span className="font-semibold text-fat">F</span><span>{meal.macros.fat}g</span>
                                </div>
                            </div>
                        </CardContent>

                        <div className="absolute top-2 right-2 z-20">
                            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleFavorite(meal.id); }}>
                                <Heart className={cn("w-6 h-6", favoriteMealIds.includes(meal.id) ? "text-red-500 fill-current" : "text-white")}/>
                            </Button>
                        </div>
                        <div className="absolute bottom-2 right-2 z-20">
                            <Button size="icon" className="bg-primary/80 hover:bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddMeal(meal); }}>
                                <Plus className="w-5 h-5"/>
                            </Button>
                        </div>
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
