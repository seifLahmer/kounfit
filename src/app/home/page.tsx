
"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, PlusCircle, Sun, Sunrise, Sunset, Heart, Loader2, Apple } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { auth } from "@/lib/firebase"
import { getUserProfile, toggleFavoriteMeal } from "@/lib/services/userService"
import { getNotifications, markNotificationAsRead } from "@/lib/services/notificationService"
import type { User, Meal, Notification } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import Link from 'next/link';
import { useRouter } from "next/navigation"

const CalorieCircle = ({ value, goal, size = "large" }: { value: number, goal: number, size?: "small" | "large" }) => {
  const radius = size === 'large' ? 56 : 28;
  const strokeWidth = size === 'large' ? 8 : 4;
  const width = size === 'large' ? 120 : 60;
  const height = size === 'large' ? 120 : 60;
  
  const percentage = goal > 0 ? (value / goal) * 100 : 0
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={`relative ${size === 'large' ? 'w-40 h-40' : 'w-20 h-20'} mx-auto`}>
      <svg className="w-full h-full" viewBox={`0 0 ${width + strokeWidth * 2} ${height + strokeWidth * 2}`}>
        <circle
          className="stroke-current text-gray-200 dark:text-gray-700"
          strokeWidth={strokeWidth}
          fill="none"
          cx={width/2 + strokeWidth}
          cy={height/2 + strokeWidth}
          r={radius}
        />
        <circle
          className="stroke-current text-primary"
          strokeWidth={strokeWidth}
          fill="none"
          cx={width/2 + strokeWidth}
          cy={height/2 + strokeWidth}
          r={radius}
          strokeLinecap="round"
          transform={`rotate(-90 ${width/2 + strokeWidth} ${height/2 + strokeWidth})`}
          style={{ strokeDasharray: circumference, strokeDashoffset, transition: "stroke-dashoffset 0.5s ease-in-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
         <p className={`${size === 'large' ? 'text-3xl' : 'text-xl'} font-bold`}>{value}</p>
        <p className={`text-sm text-muted-foreground ${size === 'large' ? '' : 'text-xs'}`}>/ {goal} kcal</p>
      </div>
    </div>
  )
}

const NutrientCircle = ({ name, value, goal, colorClass }: { name: string, value: number, goal: number, colorClass: string }) => {
    const percentage = goal > 0 ? (value / goal) * 100 : 0;
    const circumference = 2 * Math.PI * 20; // radius = 20
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative w-12 h-12">
                <svg className="w-full h-full" viewBox="0 0 48 48">
                    <circle className="stroke-current text-gray-200" strokeWidth="4" fill="none" cx="24" cy="24" r="20" />
                    <circle
                        className={`stroke-current ${colorClass}`}
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                        cx="24"
                        cy="24"
                        r="20"
                        transform="rotate(-90 24 24)"
                        style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 0.3s' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{Math.round(goal)}g</div>
            </div>
            <p className="text-xs text-muted-foreground uppercase">{name}</p>
        </div>
    );
};

const MealIconProgress = ({ icon, calories, calorieGoal }: { icon: React.ReactNode, calories: number, calorieGoal: number }) => {
  const radius = 22;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const percentage = calorieGoal > 0 ? (calories / calorieGoal) * 100 : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
       <svg className="absolute w-full h-full" viewBox="0 0 52 52">
         <circle
          className="stroke-current text-gray-200"
          strokeWidth={strokeWidth}
          fill="none"
          cx="26"
          cy="26"
          r={radius}
        />
        <circle
          className="stroke-current text-primary"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          cx="26"
          cy="26"
          r={radius}
          transform="rotate(-90 26 26)"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: "stroke-dashoffset 0.3s"
          }}
        />
      </svg>
      <div className="z-10">{icon}</div>
    </div>
  )
}

type DailyPlan = {
    breakfast: Meal | null;
    lunch: Meal | null;
    snack: Meal | null;
    dinner: Meal | null;
};

const emptyPlan: DailyPlan = { breakfast: null, lunch: null, snack: null, dinner: null };

const MealCard = ({ icon, title, meal, onAdd, onToggleFavorite, isFavorite, calorieGoal, macroGoals }: { icon: React.ReactNode, title: string, meal: Meal | null, onAdd: () => void, onToggleFavorite: (mealId: string) => void, isFavorite: boolean, calorieGoal: number, macroGoals: {protein: number, carbs: number, fat: number} }) => {
  const consumedCalories = meal?.calories || 0;
  const consumedMacros = meal?.macros || { protein: 0, carbs: 0, fat: 0 };
  
  return (
    <Card className="bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <MealIconProgress icon={icon} calories={consumedCalories} calorieGoal={calorieGoal} />
          <div>
            <CardTitle className="text-base font-bold text-foreground">{title}</CardTitle>
            <CardDescription>{consumedCalories} / {calorieGoal} Kcal</CardDescription>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="rounded-full w-12 h-12" onClick={onAdd}>
          <PlusCircle className="w-8 h-8 text-destructive" />
        </Button>
      </CardHeader>
      {meal ? (
        <CardContent>
            <div className="flex items-center gap-4">
                <Link href={`/home/meal/${meal.id}`} className="flex items-center gap-4 flex-1">
                    <Image src={meal.imageUrl} alt={meal.name} width={80} height={80} className="rounded-lg" data-ai-hint="healthy food"/>
                    <div className="flex-1">
                        <h4 className="font-semibold">{meal.name}</h4>
                        <p className="text-sm text-muted-foreground">{meal.calories} Kcal</p>
                    </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => onToggleFavorite(meal.id)}>
                    <Heart className={cn("w-5 h-5", isFavorite ? "text-red-500 fill-current" : "text-gray-400")} />
                </Button>
            </div>
        </CardContent>
      ) : (
         <CardContent>
            <div className="text-center text-muted-foreground py-4">
                <p>Aucun repas ajouté</p>
            </div>
        </CardContent>
      )}
       <CardFooter className="flex justify-around">
            <NutrientCircle name="Prot" value={consumedMacros.protein} goal={macroGoals.protein} colorClass="text-red-500" />
            <NutrientCircle name="Carbs" value={consumedMacros.carbs} goal={macroGoals.carbs} colorClass="text-green-500" />
            <NutrientCircle name="Fat" value={consumedMacros.fat} goal={macroGoals.fat} colorClass="text-yellow-500" />
        </CardFooter>
    </Card>
  )
}


export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const { toast } = useToast()
  const today = new Date()
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  
  const getInitialDailyPlan = useCallback((): DailyPlan => {
    if (typeof window === "undefined") {
      return emptyPlan;
    }
    try {
      const savedData = localStorage.getItem("dailyPlanData");
      if (savedData) {
        const { date, plan } = JSON.parse(savedData);
        const todayStr = new Date().toISOString().split('T')[0];
        // If the saved date is not today, reset the plan
        if (date !== todayStr) {
          localStorage.setItem("dailyPlanData", JSON.stringify({ date: todayStr, plan: emptyPlan }));
          return emptyPlan;
        }
        return plan;
      }
    } catch (error) {
      console.error("Failed to parse daily plan from localStorage", error);
      localStorage.removeItem("dailyPlanData");
    }
    // If nothing is saved, create a new entry for today
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem("dailyPlanData", JSON.stringify({ date: todayStr, plan: emptyPlan }));
    return emptyPlan;
  }, []);
  
  const [dailyPlan, setDailyPlan] = useState<DailyPlan>(emptyPlan);

  useEffect(() => {
    // This effect syncs state with localStorage on mount and when returning to the page.
    setDailyPlan(getInitialDailyPlan());
  }, [getInitialDailyPlan]);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
        try {
            const userProfile = await getUserProfile(firebaseUser.uid)
            setUser(userProfile)
            
            const userNotifications = await getNotifications(firebaseUser.uid);
            setNotifications(userNotifications);
            setHasUnread(userNotifications.some(n => !n.isRead));

            if (!userProfile?.photoURL) {
              const freshProfile = await getUserProfile(firebaseUser.uid);
              if (freshProfile?.photoURL) {
                setUser(freshProfile);
              }
            }
        } catch(e) {
            toast({
                title: "Error fetching user",
                description: "There was an error fetching your user data.",
                variant: "destructive",
            });
        } finally {
            setLoading(false)
        }
      } else {
        setUser(null)
        setLoading(false)
        router.replace('/welcome');
      }
    })
    return () => unsubscribe()
  }, [toast, router])


  
  const handleAddMeal = (mealType: string) => {
    router.push(`/home/add-meal/${mealType}`);
  };

  const handleToggleFavorite = async (mealId: string) => {
    if (!user) {
        toast({ title: "Vous devez être connecté", variant: "destructive"});
        return;
    }
    try {
        const updatedFavorites = await toggleFavoriteMeal(user.uid, mealId);
        setUser(prevUser => prevUser ? { ...prevUser, favoriteMealIds: updatedFavorites } : null);
    } catch (error) {
        toast({ title: "Erreur", description: "Impossible de mettre à jour les favoris.", variant: "destructive" });
    }
  };
  
  const handleNotificationClick = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      setNotifications(updatedNotifications);
      setHasUnread(updatedNotifications.some(n => !n.isRead));
    } catch (error) {
        toast({ title: "Erreur", description: "Impossible de marquer la notification comme lue.", variant: "destructive" });
    }
  };


  const consumedCalories = Object.values(dailyPlan)
    .filter(Boolean)
    .reduce((acc, meal) => acc + (meal?.calories || 0), 0);
  
  const consumedMacros = {
    protein: Object.values(dailyPlan).filter(Boolean).reduce((acc, meal) => acc + (meal?.macros.protein || 0), 0),
    carbs: Object.values(dailyPlan).filter(Boolean).reduce((acc, meal) => acc + (meal?.macros.carbs || 0), 0),
    fat: Object.values(dailyPlan).filter(Boolean).reduce((acc, meal) => acc + (meal?.macros.fat || 0), 0),
  }

  const calorieGoal = user?.calorieGoal || 2000;
  const macroGoals = user?.macroRatio || { protein: 150, carbs: 250, fat: 70 };

  const mealGoals = {
      breakfast: {
          calories: Math.round(calorieGoal * 0.25),
          macros: {
              protein: Math.round(macroGoals.protein * 0.25),
              carbs: Math.round(macroGoals.carbs * 0.25),
              fat: Math.round(macroGoals.fat * 0.25),
          }
      },
      lunch: {
          calories: Math.round(calorieGoal * 0.35),
          macros: {
              protein: Math.round(macroGoals.protein * 0.35),
              carbs: Math.round(macroGoals.carbs * 0.35),
              fat: Math.round(macroGoals.fat * 0.35),
          }
      },
      snack: {
          calories: Math.round(calorieGoal * 0.15),
          macros: {
              protein: Math.round(macroGoals.protein * 0.15),
              carbs: Math.round(macroGoals.carbs * 0.15),
              fat: Math.round(macroGoals.fat * 0.15),
          }
      },
      dinner: {
          calories: Math.round(calorieGoal * 0.25),
           macros: {
              protein: Math.round(macroGoals.protein * 0.25),
              carbs: Math.round(macroGoals.carbs * 0.25),
              fat: Math.round(macroGoals.fat * 0.25),
          }
      },
  };


  if (loading) {
      return (
          <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
      <div className="p-4 space-y-6">
        <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                 <Avatar className="h-14 w-14">
                    <AvatarImage src={user?.photoURL || ''} alt="User avatar" data-ai-hint="user avatar" />
                    <AvatarFallback>{user?.fullName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}!</h1>
                    <p className="text-muted-foreground text-sm">
                    Today is {format(today, "eeee, MMMM d'th", { locale: fr })}. Let's track your progress!
                    </p>
                </div>
            </div>
          <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0 relative">
                    <Bell />
                    {hasUnread && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Notifications</h4>
                    </div>
                    <div className="grid gap-2">
                        {notifications.length > 0 ? notifications.map((notification) => (
                             <div
                                key={notification.id}
                                className={cn(
                                    "text-sm p-2 rounded-md transition-colors",
                                    !notification.isRead ? "bg-primary/10 cursor-pointer hover:bg-primary/20" : "text-muted-foreground"
                                )}
                                onClick={() => !notification.isRead && handleNotificationClick(notification.id)}
                            >
                                <p>{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {format(notification.createdAt, "d MMM 'à' HH:mm", { locale: fr })}
                                </p>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center p-4">Aucune notification</p>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
        </header>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground text-center">
              Statistiques du Jour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CalorieCircle value={consumedCalories} goal={calorieGoal} />
             <div className="flex justify-around pt-4">
                <NutrientCircle name="Prot" value={consumedMacros.protein} goal={macroGoals.protein} colorClass="text-red-500" />
                <NutrientCircle name="Carbs" value={consumedMacros.carbs} goal={macroGoals.carbs} colorClass="text-green-500" />
                <NutrientCircle name="Fat" value={consumedMacros.fat} goal={macroGoals.fat} colorClass="text-yellow-500" />
            </div>
          </CardContent>
        </Card>

         <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground text-center">
              Repas du Jour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <MealCard icon={<Sunrise className="text-yellow-500" />} title="Petit-déjeuner" calorieGoal={mealGoals.breakfast.calories} macroGoals={mealGoals.breakfast.macros} meal={dailyPlan.breakfast} onAdd={() => handleAddMeal('breakfast')} onToggleFavorite={handleToggleFavorite} isFavorite={!!user?.favoriteMealIds?.includes(dailyPlan.breakfast?.id || '')} />
            <MealCard icon={<Sun className="text-orange-500" />} title="Déjeuner" calorieGoal={mealGoals.lunch.calories} macroGoals={mealGoals.lunch.macros} meal={dailyPlan.lunch} onAdd={() => handleAddMeal('lunch')} onToggleFavorite={handleToggleFavorite} isFavorite={!!user?.favoriteMealIds?.includes(dailyPlan.lunch?.id || '')}/>
            <MealCard icon={<Apple className="text-green-500" />} title="Collation" calorieGoal={mealGoals.snack.calories} macroGoals={mealGoals.snack.macros} meal={dailyPlan.snack} onAdd={() => handleAddMeal('snack')} onToggleFavorite={handleToggleFavorite} isFavorite={!!user?.favoriteMealIds?.includes(dailyPlan.snack?.id || '')}/>
            <MealCard icon={<Sunset className="text-purple-500" />} title="Dîner" calorieGoal={mealGoals.dinner.calories} macroGoals={mealGoals.dinner.macros} meal={dailyPlan.dinner} onAdd={() => handleAddMeal('dinner')} onToggleFavorite={handleToggleFavorite} isFavorite={!!user?.favoriteMealIds?.includes(dailyPlan.dinner?.id || '')}/>
          </CardContent>
        </Card>
      </div>
  )
}
