
"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Bell } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { auth, db } from "@/lib/firebase"
import type { User, DailyPlan, Meal } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { NutritionSummary, MealCard } from "@/components/home-page-components";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore"

const emptyPlan: DailyPlan = { breakfast: [], lunch: [], snack: [], dinner: [] };

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [unconfirmedPlan, setUnconfirmedPlan] = useState<DailyPlan>(emptyPlan);
  const [confirmedMeals, setConfirmedMeals] = useState<Meal[]>([]);

  const getUnconfirmedPlanFromStorage = useCallback((): DailyPlan => {
    if (typeof window === "undefined") return emptyPlan;
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return emptyPlan;

    try {
      const savedData = localStorage.getItem(`dailyPlanData_${firebaseUser.uid}`);
      if (savedData) {
        const { date, plan } = JSON.parse(savedData);
        if (date !== new Date().toISOString().split('T')[0]) {
          localStorage.removeItem(`dailyPlanData_${firebaseUser.uid}`);
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

  useEffect(() => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
        setLoading(false);
        router.replace('/welcome');
        return;
    }

    setLoading(true);
    
    setUnconfirmedPlan(getUnconfirmedPlanFromStorage());

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `dailyPlanData_${firebaseUser.uid}`) {
        setUnconfirmedPlan(getUnconfirmedPlanFromStorage());
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const todayStr = new Date().toISOString().split('T')[0];
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
            const userData = doc.data() as User;
            setUser(userData);
            const todaysIntake = userData.dailyIntake?.[todayStr] || [];
            setConfirmedMeals(todaysIntake);
        } else {
            toast({ title: "Erreur", description: "Profil utilisateur non trouvé", variant: "destructive"});
        }
        setLoading(false);
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeSnapshot();
    }
  }, [router, toast, getUnconfirmedPlanFromStorage]);


  const handleAddMeal = (mealType: keyof DailyPlan) => {
    router.push(`/home/add-meal/${mealType}`);
  };

  const allUnconfirmedMeals = Object.values(unconfirmedPlan).flat();
  const allMealsForToday = [...confirmedMeals, ...allUnconfirmedMeals];

  const consumedCalories = allMealsForToday.reduce((acc, meal) => acc + (meal?.calories || 0), 0);
  const consumedMacros = allMealsForToday.reduce((acc, meal) => {
    if (meal && meal.macros) {
        acc.protein += meal.macros.protein || 0;
        acc.carbs += meal.macros.carbs || 0;
        acc.fat += meal.macros.fat || 0;
    }
    return acc;
  }, { protein: 0, carbs: 0, fat: 0 });

  const calorieGoal = user?.calorieGoal || 2000;
  const macroGoals = user?.macroRatio || { protein: 150, carbs: 250, fat: 70 };
  const formattedDate = format(new Date(), "eeee d MMMM", { locale: fr });
  
  const getMealsForCategory = (category: keyof DailyPlan): Meal[] => {
    const confirmed = confirmedMeals.filter(m => m.category === category);
    const unconfirmed = unconfirmedPlan[category];
    return [...confirmed, ...unconfirmed];
  }


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
      <div className="flex flex-col min-h-screen bg-primary pb-8">
        <header className="flex-shrink-0 pt-4 pb-4">
        </header>

        <Card className="flex flex-col rounded-3xl shadow-lg">
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
                <Button asChild variant="ghost" size="icon">
                  <Link href="/notifications">
                    <Bell />
                  </Link>
                </Button>
            </div>
          
            <NutritionSummary 
              consumedCalories={consumedCalories}
              calorieGoal={calorieGoal}
              consumedMacros={consumedMacros}
              macroGoals={macroGoals}
            />
            
            <div className="grid grid-cols-2 gap-4">
                <MealCard title="Petit déjeuner" meals={getMealsForCategory('breakfast')} onAdd={() => handleAddMeal('breakfast')} defaultImage="/img home/petit-dejeuner.png" />
                <MealCard title="Déjeuner" meals={getMealsForCategory('lunch')} onAdd={() => handleAddMeal('lunch')} defaultImage="/img home/dejeuner.png" />
                <MealCard title="Dîner" meals={getMealsForCategory('dinner')} onAdd={() => handleAddMeal('dinner')} defaultImage="/img home/dinner.png" />
                <MealCard title="Collation" meals={getMealsForCategory('snack')} onAdd={() => handleAddMeal('snack')} defaultImage="/img home/snacks.png" />
            </div>
          </CardContent>
        </Card>

      </div>
  )
}
