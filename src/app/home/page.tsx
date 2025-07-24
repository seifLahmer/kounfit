
"use client"

import { useState } from "react"
import Image from "next/image"
import { Bell, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/main-layout"
import { format, startOfWeek, addDays, getDate, isSameDay } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

const NutrientCircle = ({ label, value, goal, colorClass, unit = "g" }: { label: string, value: number, goal: number, colorClass: string, unit?: string }) => {
  const percentage = goal > 0 ? (value / goal) * 100 : 0
  const circumference = 2 * Math.PI * 28
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 60 60">
          <circle
            className="stroke-current text-gray-200 dark:text-gray-700"
            strokeWidth="5"
            fill="none"
            cx="30"
            cy="30"
            r="27"
          />
          <circle
            className={`stroke-current ${colorClass}`}
            strokeWidth="5"
            fill="none"
            cx="30"
            cy="30"
            r="27"
            strokeLinecap="round"
            transform="rotate(-90 30 30)"
            style={{ strokeDasharray: circumference, strokeDashoffset, transition: "stroke-dashoffset 0.5s ease-in-out" }}
          />
        </svg>
        <div className="absolute text-center">
          <p className="font-bold text-sm md:text-base">{value}{unit}</p>
          <p className="text-xs text-muted-foreground">/ {goal}{unit}</p>
        </div>
      </div>
      <p className="text-sm font-semibold">{label}</p>
    </div>
  )
}

const MealRow = ({ mealType, mealName, calories, imageUrl, imageHint }: { mealType: string, mealName: string, calories: string, imageUrl: string, imageHint: string }) => (
    <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-100">
        <Image src={imageUrl} alt={mealName} width={64} height={64} className="rounded-lg object-cover" data-ai-hint={imageHint} />
        <div className="flex-1">
            <h4 className="font-semibold text-sm">{mealType}</h4>
            <p className="text-muted-foreground text-sm">{mealName}</p>
            <p className="text-xs font-medium">{calories}</p>
        </div>
        <Button size="icon" variant="ghost" className="rounded-full">
            <PlusCircle className="w-5 h-5 text-primary" />
        </Button>
    </div>
);


export default function HomePage() {

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);

  const startOfTheWeek = startOfWeek(currentDate, { locale: fr });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfTheWeek, i));

  const formattedDate = `Aujourd'hui, ${capitalize(format(today, "eeee d MMMM", { locale: fr }))}`;
  
  const handlePrevWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };
  
  const weekRange = `${format(startOfTheWeek, 'd')} - ${format(addDays(startOfTheWeek, 6), 'd MMM yyyy', { locale: fr })}`;


  return (
    <MainLayout>
      <div className="p-4 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bonjour, Zakaria!</h1>
            <p className="text-muted-foreground text-sm">{formattedDate}</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell />
          </Button>
        </header>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-center text-primary">Votre Plan Hebdomadaire</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-sm font-semibold text-primary">{weekRange}</div>
              <Button variant="ghost" size="icon" onClick={handleNextWeek}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="grid grid-cols-7 text-center gap-x-1 gap-y-2">
              {weekDays.map(day => (
                <div key={day.toString()} className="flex flex-col items-center space-y-2">
                  <p className="text-xs text-muted-foreground uppercase">{format(day, 'E', { locale: fr })}</p>
                  <button className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-lg font-semibold transition-colors",
                    isSameDay(day, today) 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-primary/10"
                  )}>
                    {getDate(day)}
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
             <CardTitle className="text-lg text-center text-primary">Statistiques du Jour</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            <h3 className="text-center font-semibold">Apport Calorique</h3>
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="stroke-current text-gray-200 dark:text-gray-700"
                  strokeWidth="10"
                  fill="none"
                  cx="50"
                  cy="50"
                  r="45"
                />
                  <circle
                  className="stroke-current text-primary"
                  strokeWidth="10"
                  fill="none"
                  cx="50"
                  cy="50"
                  r="45"
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ 
                    strokeDasharray: `${(1500 / 2759) * 2 * Math.PI * 45}`, 
                    strokeDashoffset: '0',
                    transition: "stroke-dasharray 0.5s ease-in-out"
                  }}
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-4xl font-bold text-foreground">1500</p>
                <p className="text-muted-foreground">/ 2759 kcal</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-y-6 text-center">
              <NutrientCircle label="Protéines" value={80} goal={160} colorClass="text-blue-500" />
              <NutrientCircle label="Glucides" value={200} goal={386} colorClass="text-orange-500" />
              <NutrientCircle label="Lipides" value={40} goal={64} colorClass="text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
           <CardHeader>
             <CardTitle className="text-lg text-center text-primary">Repas du Jour</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <MealRow 
                mealType="Petit-déjeuner"
                mealName="Omelette aux légumes"
                calories="350 kcal"
                imageUrl="https://placehold.co/128x128.png"
                imageHint="vegetable omelette"
            />
             <MealRow 
                mealType="Déjeuner"
                mealName="Poulet grillé, Riz"
                calories="550 kcal"
                imageUrl="https://placehold.co/128x128.png"
                imageHint="grilled chicken rice"
            />
             <MealRow 
                mealType="Dîner"
                mealName="Saumon, Asperges"
                calories="450 kcal"
                imageUrl="https://placehold.co/128x128.png"
                imageHint="salmon asparagus"
            />
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  )
}

    