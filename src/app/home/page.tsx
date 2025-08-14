"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Plus, Bell } from "lucide-react"
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
import { CalorieCircle, MacroCard, MealGridCard } from "@/components/home-page-components";

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
        // Ensure all meal types are arrays
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
  const consumedMacros = {
    protein: allMeals.reduce((acc, meal) => acc + (meal?.macros.protein || 0), 0),
    carbs: allMeals.reduce((acc, meal) => acc + (meal?.macros.carbs || 0), 0),
    fat: allMeals.reduce((acc, meal) => acc + (meal?.macros.fat || 0), 0),
  }

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
      <div className="flex flex-col h-full bg-primary">
        <header className="flex-shrink-0 flex items-center justify-between p-4 text-white">
            <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border-2 border-white/50">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.fullName} />
                    <AvatarFallback>{user?.fullName?.[0]}</AvatarFallback>
                </Avatar>
                 <div>
                    <h1 className="text-lg font-bold font-heading text-white/90">
                      Welcome back, {user?.fullName}!
                    </h1>
                    <p className="text-sm text-white/70 capitalize">
                      It's {formattedDate}. Let's track your progress.
                    </p>
                </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white">
                <Bell />
            </Button>
        </header>

        <Card className="flex-grow flex flex-col">
          <CardContent className="p-4 space-y-6">
            <Card>
                <CardContent className="p-6">
                    <CalorieCircle consumed={consumedCalories} goal={calorieGoal} />
                </CardContent>
            </Card>
            
            <div className="flex gap-4">
                <MacroCard name="Protéines" consumed={consumedMacros.protein} goal={macroGoals.protein} color="bg-protein" />
                <MacroCard name="Glucides" consumed={consumedMacros.carbs} goal={macroGoals.carbs} color="bg-carbs" />
                <MacroCard name="Lipides" consumed={consumedMacros.fat} goal={macroGoals.fat} color="bg-fat" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <MealGridCard title="Petit déjeuner" meals={dailyPlan.breakfast} onAdd={() => handleAddMeal('breakfast')} defaultImage="/petit-dejeuner.png" calorieGoal={calorieGoal} macroGoals={macroGoals} />
                <MealGridCard title="Déjeuner" meals={dailyPlan.lunch} onAdd={() => handleAddMeal('lunch')} defaultImage="/dejeuner.png" calorieGoal={calorieGoal} macroGoals={macroGoals} />
                <MealGridCard title="Dîner" meals={dailyPlan.dinner} onAdd={() => handleAddMeal('dinner')} defaultImage="/dinner.png" calorieGoal={calorieGoal} macroGoals={macroGoals} />
                <MealGridCard title="Collation" meals={dailyPlan.snack} onAdd={() => handleAddMeal('snack')} defaultImage="/snacks.png" calorieGoal={calorieGoal} macroGoals={macroGoals} />
            </div>
          </CardContent>
        </Card>

      </div>
  )
}