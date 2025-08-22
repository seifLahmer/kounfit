
"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Bell } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { auth } from "@/lib/firebase"
import { getUserProfile } from "@/lib/services/userService"
import type { User, DailyPlan } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { NutritionSummary, MealCard } from "@/components/home-page-components";

const emptyPlan: DailyPlan = { breakfast: [], lunch: [], snack: [], dinner: [] };

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  const getInitialDailyPlan = useCallback((): DailyPlan => {
    if (typeof window === "undefined") return emptyPlan;
    try {
      const savedData = localStorage.getItem("dailyPlanData");
      if (savedData) {
        const { date, plan } = JSON.parse(savedData);
        if (date !== new Date().toISOString().split('T')[0]) {
          localStorage.removeItem("dailyPlanData");
          return emptyPlan;
        }
        return {
          breakfast: Array.isArray(plan.breakfast) ? plan.breakfast : [],
          lunch: Array.isArray(plan.lunch) ? plan.lunch : [],
          snack: Array.isArray(plan.snack) ? plan.snack : [],
          dinner: Array.isArray(plan.dinner) ? plan.dinner : [],
        };
      }
    } catch (error) {
      console.error("Failed to parse daily plan", error);
    }
    return emptyPlan;
  }, []);
  
  const [dailyPlan, setDailyPlan] = useState<DailyPlan>(emptyPlan);

  useEffect(() => {
    setDailyPlan(getInitialDailyPlan());

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
            const userProfile = await getUserProfile(firebaseUser.uid)
            if (!userProfile) throw new Error("User profile not found");
            setUser(userProfile);
        } catch(e) {
            toast({ title: "Error fetching user", variant: "destructive" });
            setUser(null);
            router.replace('/welcome');
        } finally {
            setLoading(false);
        }
      } else {
        setUser(null)
        setLoading(false)
        router.replace('/welcome');
      }
    })
    
    return () => unsubscribe()
  }, [toast, router, getInitialDailyPlan])

  const handleAddMeal = (mealType: keyof DailyPlan) => {
    router.push(`/home/add-meal/${mealType}`);
  };

  const allMeals = Object.values(dailyPlan).flat();
  const consumedCalories = allMeals.reduce((acc, meal) => acc + (meal?.calories || 0), 0);
  const consumedMacros = allMeals.reduce((acc, meal) => {
    acc.protein += meal?.macros.protein || 0;
    acc.carbs += meal?.macros.carbs || 0;
    acc.fat += meal?.macros.fat || 0;
    return acc;
  }, { protein: 0, carbs: 0, fat: 0 });

  const calorieGoal = user?.calorieGoal || 2000;
  const macroGoals = user?.macroRatio || { protein: 150, carbs: 250, fat: 70 };
  const formattedDate = format(new Date(), "eeee, d MMMM", { locale: fr });

  if (loading) {
      return (
          <div className="flex justify-center items-center h-screen bg-background">
             <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Chargement de votre plan...</p>
             </div>
          </div>
      )
  }

  return (
      <div className="flex flex-col min-h-screen bg-primary px-4">
        <header className="flex-shrink-0 pt-8 pb-4">
        </header>

        <Card className="flex-grow flex flex-col rounded-3xl shadow-lg">
          <CardContent className="p-4 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 border-2 border-primary/20">
                        <AvatarImage src={user?.photoURL || ''} alt={user?.fullName} />
                        <AvatarFallback>{user?.fullName?.[0]}</AvatarFallback>
                    </Avatar>
                     <div>
                        <h1 className="text-lg font-bold font-heading text-foreground">
                          Bonjour, {user?.fullName}!
                        </h1>
                        <p className="text-sm text-muted-foreground capitalize">
                          C'est {formattedDate}.
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon">
                    <Bell />
                </Button>
            </div>
          
            <NutritionSummary 
              consumedCalories={consumedCalories}
              calorieGoal={calorieGoal}
              consumedMacros={consumedMacros}
              macroGoals={macroGoals}
            />
            
            <div className="grid grid-cols-2 gap-4 pb-24">
                <MealCard title="Petit déjeuner" meals={dailyPlan.breakfast} onAdd={() => handleAddMeal('breakfast')} defaultImage="/petit-dejeuner.png" />
                <MealCard title="Déjeuner" meals={dailyPlan.lunch} onAdd={() => handleAddMeal('lunch')} defaultImage="/dejeuner.png" />
                <MealCard title="Dîner" meals={dailyPlan.dinner} onAdd={() => handleAddMeal('dinner')} defaultImage="/dinner.png" />
                <MealCard title="Collation" meals={dailyPlan.snack} onAdd={() => handleAddMeal('snack')} defaultImage="/snacks.png" />
            </div>
          </CardContent>
        </Card>

      </div>
  )
}
