
"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Bell } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { auth, db } from "@/lib/firebase"
import { getUserProfile } from "@/lib/services/userService"
import type { User, DailyPlan, Meal } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { NutritionSummary, MealCard } from "@/components/home-page-components";
import Link from "next/link";
import { fetchTodayFitData, type FitData, checkGoogleFitPermission } from "@/lib/services/googleFitService"
import { StepsIcon, DistanceIcon, MoveMinutesIcon, HeartPointsIcon } from "@/components/icons"
import { doc, onSnapshot } from "firebase/firestore"

const emptyPlan: DailyPlan = { breakfast: [], lunch: [], snack: [], dinner: [] };

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [fitData, setFitData] = useState<FitData | null>(null);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan>(emptyPlan);
  const [confirmedMeals, setConfirmedMeals] = useState<Meal[]>([]);

  // Function to get unconfirmed meals from localStorage
  const getUnconfirmedPlan = useCallback((): DailyPlan => {
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

  // Effect to listen for changes in localStorage and user's confirmed meals
  useEffect(() => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
        setLoading(false);
        router.replace('/welcome');
        return;
    }

    setLoading(true);
    
    // Set initial plan from localStorage
    setDailyPlan(getUnconfirmedPlan());

    // Listener for localStorage changes
    const handleStorageChange = () => setDailyPlan(getUnconfirmedPlan());
    window.addEventListener('storage', handleStorageChange);

    // Listener for confirmed meals from Firestore
    const todayStr = new Date().toISOString().split('T')[0];
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
        const userData = doc.data() as User;
        if (userData) {
            setUser(userData);
            const todaysIntake = userData.dailyIntake?.[todayStr] || [];
            setConfirmedMeals(todaysIntake);
        } else {
            toast({ title: "Erreur", description: "Profil utilisateur non trouvé", variant: "destructive"});
        }
    });

    // Fetch Google Fit data once
    checkGoogleFitPermission().then(hasPermission => {
        if (hasPermission) {
            fetchTodayFitData().catch(fitError => {
                console.error("Could not fetch Google Fit data on Home page:", fitError);
            }).then(data => {
                if (data) setFitData(data);
            });
        }
    }).finally(() => {
        setLoading(false);
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeSnapshot();
    }
  }, [router, toast, getUnconfirmedPlan]);


  const handleAddMeal = (mealType: keyof DailyPlan) => {
    router.push(`/home/add-meal/${mealType}`);
  };

  const allUnconfirmedMeals = Object.values(dailyPlan).flat();
  const allMealsForToday = [...confirmedMeals, ...allUnconfirmedMeals];

  const consumedCalories = allMealsForToday.reduce((acc, meal) => acc + (meal?.calories || 0), 0);
  const consumedMacros = allMealsForToday.reduce((acc, meal) => {
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

            {fitData ? (
              <Card>
                <CardContent className="p-3">
                   <p className="text-sm font-semibold text-muted-foreground mb-2">Activité du jour (via Google Fit)</p>
                   <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                       <div className="flex items-center gap-2">
                          <StepsIcon className="w-5 h-5 text-primary"/>
                          <div>
                            <p className="font-bold">{fitData.steps.toLocaleString('fr-FR')}</p>
                            <p className="text-xs text-muted-foreground">Pas</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <DistanceIcon className="w-5 h-5 text-destructive"/>
                           <div>
                            <p className="font-bold">{(fitData.distance / 1000).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">km</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <MoveMinutesIcon className="w-5 h-5 text-yellow-500"/>
                           <div>
                            <p className="font-bold">{fitData.moveMinutes}</p>
                            <p className="text-xs text-muted-foreground">Min d'activité</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <HeartPointsIcon className="w-5 h-5 text-red-500"/>
                           <div>
                            <p className="font-bold">{fitData.heartPoints}</p>
                            <p className="text-xs text-muted-foreground">Points cardio</p>
                          </div>
                       </div>
                   </div>
                </CardContent>
              </Card>
            ) : (
                <Card className="bg-muted">
                    <CardContent className="p-3 text-center">
                        <p className="text-sm text-muted-foreground">Connectez Google Fit pour voir votre activité ici.</p>
                        <Button variant="link" size="sm" asChild>
                            <Link href="/profile">Se connecter depuis le profil</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
            
            <div className="grid grid-cols-2 gap-4">
                <MealCard title="Petit déjeuner" meals={[...(user?.dailyIntake?.[new Date().toISOString().split('T')[0]]?.filter(m => m.category === 'breakfast') || []), ...dailyPlan.breakfast]} onAdd={() => handleAddMeal('breakfast')} defaultImage="/img home/petit-dejeuner.png" />
                <MealCard title="Déjeuner" meals={[...(user?.dailyIntake?.[new Date().toISOString().split('T')[0]]?.filter(m => m.category === 'lunch') || []), ...dailyPlan.lunch]} onAdd={() => handleAddMeal('lunch')} defaultImage="/img home/dejeuner.png" />
                <MealCard title="Dîner" meals={[...(user?.dailyIntake?.[new Date().toISOString().split('T')[0]]?.filter(m => m.category === 'dinner') || []), ...dailyPlan.dinner]} onAdd={() => handleAddMeal('dinner')} defaultImage="/img home/dinner.png" />
                <MealCard title="Collation" meals={[...(user?.dailyIntake?.[new Date().toISOString().split('T')[0]]?.filter(m => m.category === 'snack') || []), ...dailyPlan.snack]} onAdd={() => handleAddMeal('snack')} defaultImage="/img home-page/snacks.png" />
            </div>
          </CardContent>
        </Card>

      </div>
  )
}
