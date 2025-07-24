
"use client"

import { useState } from "react"
import Image from "next/image"
import { Bell, Heart, PlusCircle, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/main-layout"
import { Progress } from "@/components/ui/progress"

const NutrientCircle = ({ label, value, goal, colorClass, unit = "g" }: { label: string, value: number, goal: number, colorClass: string, unit?: string }) => {
  const percentage = goal > 0 ? (value / goal) * 100 : 0
  const circumference = 2 * Math.PI * 20
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center space-y-1">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 44 44">
          <circle
            className="stroke-current text-gray-200 dark:text-gray-700"
            strokeWidth="4"
            fill="none"
            cx="22"
            cy="22"
            r="20"
          />
          <circle
            className={`stroke-current ${colorClass}`}
            strokeWidth="4"
            fill="none"
            cx="22"
            cy="22"
            r="20"
            strokeLinecap="round"
            transform="rotate(-90 22 22)"
            style={{ strokeDasharray: circumference, strokeDashoffset, transition: "stroke-dashoffset 0.5s ease-in-out" }}
          />
        </svg>
        <div className="absolute text-center">
          <p className="font-bold text-xs">{value}{unit}</p>
        </div>
      </div>
      <p className="text-xs font-semibold">{label}</p>
      <p className="text-xs text-muted-foreground">/ {goal}{unit}</p>
    </div>
  )
}

const MealCard = ({ mealType, mealName, calories, imageUrl, imageHint, onAdd, onFavorite }: { mealType: string, mealName?: string, calories?: string, imageUrl?: string, imageHint?: string, onAdd: () => void, onFavorite: () => void }) => (
    <Card className="overflow-hidden">
        <CardHeader className="p-0">
            {imageUrl ? (
                <div className="relative">
                    <Image src={imageUrl} alt={mealName || mealType} width={400} height={200} className="w-full h-32 object-cover" data-ai-hint={imageHint} />
                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 bg-white/70 rounded-full w-8 h-8" onClick={onFavorite}>
                        <Heart className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            ) : (
                 <div className="h-32 bg-gray-100 flex items-center justify-center">
                    <p className="text-muted-foreground">{mealType}</p>
                 </div>
            )}
        </CardHeader>
        <CardContent className="p-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold">{mealName || "Choose a meal"}</h3>
                    <p className="text-sm text-muted-foreground">{calories || '—'} kcal</p>
                </div>
                <Button size="icon" variant="outline" className="rounded-full w-10 h-10 bg-primary text-primary-foreground hover:bg-primary/90" onClick={onAdd}>
                    <PlusCircle className="w-5 h-5" />
                </Button>
            </div>
             <div className="grid grid-cols-3 gap-y-4 text-center mt-4">
              <NutrientCircle label="Proteins" value={40} goal={53} colorClass="text-blue-500" />
              <NutrientCircle label="Carbs" value={95} goal={129} colorClass="text-orange-500" />
              <NutrientCircle label="Lipids" value={15} goal={21} colorClass="text-yellow-500" />
            </div>
        </CardContent>
    </Card>
);

export default function HomePage() {
  const [calories, setCalories] = useState(1500)
  const calorieGoal = 2759

  return (
    <MainLayout>
      <div className="p-4 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bonjour, Zakaria!</h1>
            <p className="text-muted-foreground text-sm">Prêt à atteindre vos objectifs ?</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell />
          </Button>
        </header>

        <Card>
          <CardHeader>
             <CardTitle className="text-lg font-semibold text-center">Objectif Calorique du Jour</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <div className="text-center">
              <span className="text-2xl font-bold">{calories}</span>
              <span className="text-muted-foreground"> / {calorieGoal} kcal</span>
            </div>
            <Progress value={(calories / calorieGoal) * 100} className="w-full h-3" />
          </CardContent>
        </Card>

        <div className="space-y-6">
            <MealCard
                mealType="Petit-déjeuner"
                mealName="Omelette aux légumes"
                calories="350"
                imageUrl="https://placehold.co/400x200.png"
                imageHint="vegetable omelette"
                onAdd={() => console.log('Add breakfast')}
                onFavorite={() => console.log('Favorite breakfast')}
            />
            <MealCard
                mealType="Déjeuner"
                mealName="Poulet grillé, Riz"
                calories="550"
                imageUrl="https://placehold.co/400x200.png"
                imageHint="grilled chicken rice"
                onAdd={() => console.log('Add lunch')}
                onFavorite={() => console.log('Favorite lunch')}
            />
            <MealCard
                mealType="Dîner"
                 onAdd={() => console.log('Add dinner')}
                onFavorite={() => console.log('Favorite dinner')}
            />
        </div>

      </div>
    </MainLayout>
  )
}
