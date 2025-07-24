
"use client"

import { useState } from "react"
import { Bell, ChevronLeft, ChevronRight, PlusCircle, Sun, Sunrise, Sunset, Heart } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { MainLayout } from "@/components/main-layout"
import { addDays, format, startOfWeek } from "date-fns"
import { fr } from "date-fns/locale"

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
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{value}g</div>
            </div>
            <p className="text-xs text-muted-foreground uppercase">{name}</p>
        </div>
    );
};

const MealCard = ({ icon, title, calories, meal, onAdd }: { icon: React.ReactNode, title: string, calories: number, meal: any, onAdd: () => void }) => {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <CardTitle className="text-base font-bold">{title}</CardTitle>
            <CardDescription>{calories} Kcal</CardDescription>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="rounded-full w-10 h-10" onClick={onAdd}>
          <PlusCircle className="w-6 h-6 text-primary" />
        </Button>
      </CardHeader>
      {meal ? (
        <CardContent>
            <div className="flex items-center gap-4">
                <Image src={meal.image} alt={meal.name} width={80} height={80} className="rounded-lg" data-ai-hint="healthy food"/>
                <div className="flex-1">
                    <h4 className="font-semibold">{meal.name}</h4>
                    <p className="text-sm text-muted-foreground">{meal.calories} Kcal</p>
                </div>
                <Button variant="ghost" size="icon">
                    <Heart className="w-5 h-5"/>
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
            <NutrientCircle name="Prot" value={meal?.protein || 0} goal={50} colorClass="text-red-500" />
            <NutrientCircle name="Carbs" value={meal?.carbs || 0} goal={80} colorClass="text-green-500" />
            <NutrientCircle name="Fat" value={meal?.fat || 0} goal={20} colorClass="text-yellow-500" />
        </CardFooter>
    </Card>
  )
}


export default function HomePage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const today = new Date()

  const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeekDate, i))

  const handlePrevWeek = () => {
    setCurrentDate(addDays(currentDate, -7))
  }

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7))
  }
  
  const handleAddMeal = (mealType: string) => {
    // Logic to open meal selection modal/page
    console.log(`Adding meal for ${mealType}`);
  };
  
  const breakfast = null;
  const lunch = { name: "Escalope Grillée", calories: 600, protein: 30, carbs: 20, fat: 10, image: "https://placehold.co/100x100.png" };
  const dinner = null;


  return (
    <MainLayout>
      <div className="p-4 space-y-6">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, Zakaria!</h1>
            <p className="text-muted-foreground text-sm">
              Today is {format(today, "eeee, MMMM d'th", { locale: fr })}. Let's track your progress!
            </p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
            <Bell />
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground text-center">
              Votre Plan Hebdomadaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
                <ChevronLeft />
              </Button>
              <div className="text-center font-semibold">
                {format(startOfWeekDate, "d")} - {format(addDays(startOfWeekDate, 6), "d MMM, yyyy", { locale: fr })}
              </div>
              <Button variant="ghost" size="icon" onClick={handleNextWeek}>
                <ChevronRight />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">
                    {format(day, "eee", { locale: fr })}
                  </p>
                  <Button
                    variant={"ghost"}
                    size="icon"
                    className={cn("w-10 h-10 rounded-full", {
                      "bg-red-500 text-white hover:bg-red-600": format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
                    })}
                  >
                    {format(day, "d")}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground text-center">
              Statistiques du Jour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CalorieCircle value={lunch?.calories || 0} goal={2759} />
             <div className="flex justify-around pt-4">
                <NutrientCircle name="Prot" value={lunch?.protein || 0} goal={172} colorClass="text-red-500" />
                <NutrientCircle name="Carbs" value={lunch?.carbs || 0} goal={276} colorClass="text-green-500" />
                <NutrientCircle name="Fat" value={lunch?.fat || 0} goal={61} colorClass="text-yellow-500" />
            </div>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground text-center">
              Repas du Jour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <MealCard icon={<Sunrise className="text-yellow-500" />} title="Petit-déjeuner" calories={700} meal={breakfast} onAdd={() => handleAddMeal('breakfast')} />
            <MealCard icon={<Sun className="text-orange-500" />} title="Déjeuner" calories={1000} meal={lunch} onAdd={() => handleAddMeal('lunch')} />
            <MealCard icon={<Sunset className="text-purple-500" />} title="Dîner" calories={600} meal={dinner} onAdd={() => handleAddMeal('dinner')} />
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  )
}
