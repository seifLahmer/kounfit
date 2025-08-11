
"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Plus, Bell, Utensils } from "lucide-react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { auth } from "@/lib/firebase"
import { getUserProfile } from "@/lib/services/userService"
import type { User, Meal, DailyPlan } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const emptyPlan: DailyPlan = { breakfast: [], lunch: [], snack: [], dinner: [] };

const CalorieCircle = ({ consumed, goal }: { consumed: number; goal: number }) => {
  const percentage = goal > 0 ? (consumed / goal) * 100 : 0;
  const circumference = 2 * Math.PI * 56; // radius = 56
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                className="stroke-current text-gray-200"
                strokeWidth="8"
                fill="none"
                cx="60"
                cy="60"
                r="56"
                />
                <circle
                className="stroke-current text-primary"
                strokeWidth="8"
                fill="none"
                cx="60"
                cy="60"
                r="56"
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ strokeDasharray: circumference, strokeDashoffset, transition: "stroke-dashoffset 0.5s" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-heading text-foreground">{consumed}</span>
                <span className="text-sm text-muted-foreground">dans la cible</span>
            </div>
        </div>
        <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Restant / consommées</span>
            <span className="text-4xl font-bold font-heading text-foreground">{Math.max(0, goal - consumed)} kcal</span>
            <span className="text-lg text-muted-foreground">restantes</span>
             <svg width="100" height="20" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-2">
                <path d="M2 10C12.0667 2.33333 24.4 -1.4 34 5C45 12.5 56.6667 15.1667 66.5 12C76.3333 8.83333 86.5 7.5 98 14" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        </div>
    </div>
  );
};

const MacroCard = ({ name, consumed, goal, color }: { name: string; consumed: number; goal: number; color: string }) => {
  const percentage = goal > 0 ? (consumed / goal) * 100 : 0;
  return (
    <Card className="flex-1">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{name}</p>
        <p className="text-2xl font-bold font-heading text-foreground">{consumed} g</p>
        <p className="text-xs text-muted-foreground">sur {goal} g</p>
        <Progress value={percentage} indicatorClassName={color} className="h-2 mt-2" />
         <p className="text-right text-xs mt-1 text-muted-foreground">{Math.round(percentage)}%</p>
      </CardContent>
    </Card>
  );
};

const MealProgressCircle = ({ calories, calorieGoal }: { calories: number, calorieGoal: number }) => {
  const targetCaloriesPerMeal = calorieGoal > 0 ? calorieGoal / 4 : 500; // Assume 4 meals a day
  const percentage = calorieGoal > 0 ? (calories / targetCaloriesPerMeal) * 100 : 0;
  const circumference = 2 * Math.PI * 18; // radius = 18
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-12 h-12">
      <svg className="w-full h-full" viewBox="0 0 40 40">
        <circle
          className="stroke-current text-white/20"
          strokeWidth="3"
          fill="none"
          cx="20"
          cy="20"
          r="18"
        />
        <circle
          className="stroke-current text-white"
          strokeWidth="3"
          fill="none"
          cx="20"
          cy="20"
          r="18"
          strokeLinecap="round"
          transform="rotate(-90 20 20)"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: "stroke-dashoffset 0.5s",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-white">
        {calories > 0 ? (
          <span className="text-xs font-bold">{calories}</span>
        ) : (
          <Utensils className="w-4 h-4" />
        )}
      </div>
    </div>
  );
};

const MacroProgressCircle = ({ consumed, goal, colorClass, label }: { consumed: number; goal: number; colorClass: string; label: string }) => {
  const percentage = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 12; // radius = 12
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-7 h-7">
        <svg className="w-full h-full" viewBox="0 0 28 28">
          <circle className="stroke-current text-white/20" strokeWidth="2" fill="none" cx="14" cy="14" r="12" />
          <circle
            className={`stroke-current ${colorClass}`}
            strokeWidth="2"
            fill="none"
            cx="14"
            cy="14"
            r="12"
            strokeLinecap="round"
            transform="rotate(-90 14 14)"
            style={{ strokeDasharray: circumference, strokeDashoffset, transition: "stroke-dashoffset 0.5s" }}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center font-bold text-white text-[10px]`}>
          P
        </div>
      </div>
       <span className="text-xs">{Math.round(consumed)}g</span>
    </div>
  );
};

const MealGridCard = ({ title, meals, onAdd, defaultImage, calorieGoal, macroGoals }: { title: string; meals: Meal[]; onAdd: () => void; defaultImage: string; calorieGoal: number; macroGoals: User['macroRatio'] }) => {
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalMacros = meals.reduce((sum, meal) => {
    sum.protein += meal.macros.protein || 0;
    sum.carbs += meal.macros.carbs || 0;
    sum.fat += meal.macros.fat || 0;
    return sum;
  }, { protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="relative rounded-lg overflow-hidden shadow-sm h-48 flex flex-col justify-end p-4 text-white" onClick={onAdd}>
      <Image
        src={defaultImage}
        alt={title}
        layout="fill"
        objectFit="cover"
        className="z-0"
        data-ai-hint="healthy food"
      />
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      <div className="relative z-20 flex justify-between items-end">
         <div className="space-y-1">
            <h3 className="font-bold text-lg font-heading">{title}</h3>
            <MealProgressCircle calories={totalCalories} calorieGoal={calorieGoal} />
         </div>
         <div className="flex gap-2">
            <MacroProgressCircle consumed={totalMacros.protein} goal={macroGoals.protein / 4} colorClass="text-protein" label="P" />
            <MacroProgressCircle consumed={totalMacros.carbs} goal={macroGoals.carbs / 4} colorClass="text-carbs" label="C" />
            <MacroProgressCircle consumed={totalMacros.fat} goal={macroGoals.fat / 4} colorClass="text-fat" label="F" />
         </div>
      </div>
      <button className="absolute top-3 right-3 bg-primary hover:bg-primary/90 text-white rounded-full w-8 h-8 flex items-center justify-center z-20">
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};

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
        // Ensure all categories are arrays
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
      <div className="p-4 space-y-6">
        <header className="flex items-center justify-between p-4 bg-pistachio rounded-lg">
            <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.fullName} />
                    <AvatarFallback>{user?.fullName?.[0]}</AvatarFallback>
                </Avatar>
                 <div>
                    <h1 className="text-2xl font-bold font-heading text-foreground">Aujourd'hui</h1>
                    <p className="text-muted-foreground capitalize">{format(new Date(), "eeee, d MMMM", { locale: fr })}</p>
                </div>
            </div>
            <Button variant="ghost" size="icon" className="text-tertiary">
                <Bell />
            </Button>
        </header>

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

      </div>
  )
}

    