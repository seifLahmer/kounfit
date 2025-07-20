"use client"

import { useState } from "react"
import { Bell, ChevronLeft, ChevronRight, Sunrise, Sun, Moon, Cookie, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MainLayout } from "@/components/main-layout"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"


const Day = ({ day, date, isToday, isSelected, onClick }: { day: string; date: number; isToday?: boolean; isSelected?: boolean; onClick: () => void }) => (
  <div className="text-center space-y-2 cursor-pointer" onClick={onClick}>
    <p className="text-sm text-muted-foreground">{day}</p>
    <div
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-full font-semibold",
        isSelected ? "bg-red-500 text-white" : "bg-transparent",
        isToday && !isSelected && "text-red-500"
      )}
    >
      {date}
    </div>
  </div>
)

const daysOfWeek = [
  { short: "lun", date: 14 },
  { short: "mar", date: 15 },
  { short: "mer", date: 16 },
  { short: "jeu", date: 17 },
  { short: "ven", date: 18, isToday: true },
  { short: "sam", date: 19 },
  { short: "dim", date: 20 },
]

const NutrientCircle = ({ label, value, goal, colorClass }: { label: string, value: number, goal: number, colorClass: string }) => {
  const percentage = goal > 0 ? (value / goal) * 100 : 0
  const circumference = 2 * Math.PI * 28
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 60 60">
          <circle
            className="stroke-current text-gray-200"
            strokeWidth="4"
            fill="none"
            cx="30"
            cy="30"
            r="28"
          />
          <circle
            className={`stroke-current ${colorClass}`}
            strokeWidth="4"
            fill="none"
            cx="30"
            cy="30"
            r="28"
            strokeLinecap="round"
            transform="rotate(-90 30 30)"
            style={{ strokeDasharray: circumference, strokeDashoffset }}
          />
        </svg>
        <div className="absolute text-center">
          <p className="font-bold">{value}g</p>
          <p className="text-xs text-muted-foreground">/ {goal}g</p>
        </div>
      </div>
      <p className="text-sm font-semibold">{label}</p>
    </div>
  )
}

const MealItem = ({ icon: Icon, name, calories, goal }: { icon: React.ElementType, name: string, calories: number, goal: number }) => (
   <AccordionItem value={name} className="border-b-0">
    <Card className="mb-2 shadow-sm">
      <CardContent className="p-0">
        <AccordionTrigger className="p-4 text-base hover:no-underline">
          <div className="flex items-center gap-4 w-full">
            <div className="bg-gray-100 p-3 rounded-full">
              <Icon className="w-5 h-5 text-gray-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{calories} / {goal} kcal</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button size="icon" variant="ghost" className="text-red-500 h-8 w-8">
                <Plus />
              </Button>
            </div>
          </div>
        </AccordionTrigger>
      </CardContent>
    </Card>
    <AccordionContent>
      <div className="p-4 pt-0">
        <p>Details about {name}.</p>
      </div>
    </AccordionContent>
  </AccordionItem>
)

const mealData = [
    { icon: Sunrise, name: "Petit Déjeuner", calories: 0, goal: 690 },
    { icon: Sun, name: "Déjeuner", calories: 0, goal: 966 },
    { icon: Moon, name: "Dîner", calories: 0, goal: 828 },
    { icon: Cookie, name: "Collation", calories: 0, goal: 276 },
]

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(18)

  return (
    <MainLayout>
      <div className="p-4 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, Zakaria!</h1>
            <p className="text-muted-foreground">Today is {format(new Date(), "EEEE, MMMM do")}. Let's track your progress!</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell />
          </Button>
        </header>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-bold text-center text-red-500 mb-2">Votre Plan Hebdomadaire</h2>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon">
                <ChevronLeft />
              </Button>
              <p className="font-semibold">14 - 20 juil. 2025</p>
              <Button variant="ghost" size="icon">
                <ChevronRight />
              </Button>
            </div>
            <div className="flex justify-around">
              {daysOfWeek.map((day) => (
                <Day
                  key={day.date}
                  day={day.short}
                  date={day.date}
                  isToday={day.isToday}
                  isSelected={selectedDate === day.date}
                  onClick={() => setSelectedDate(day.date)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-6">
            <h2 className="text-lg font-bold text-center text-red-500">Statistiques du Jour</h2>
            
            <div>
              <p className="text-center font-semibold text-lg mb-4">Apport Calorique</p>
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="stroke-current text-gray-200"
                    strokeWidth="8"
                    fill="none"
                    cx="50"
                    cy="50"
                    r="45"
                  />
                   <circle
                    className="stroke-current text-red-500"
                    strokeWidth="8"
                    fill="none"
                    cx="50"
                    cy="50"
                    r="45"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    style={{ strokeDasharray: `${(1500 / 2759) * 2 * Math.PI * 45}`, strokeDashoffset: '0' }}
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-4xl font-bold">1500</p>
                  <p className="text-muted-foreground">/ 2759 kcal</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-center font-semibold text-lg mb-4">Répartition des Nutriments</p>
              <div className="grid grid-cols-2 gap-y-6">
                <NutrientCircle label="Protéines" value={80} goal={160} colorClass="text-blue-500" />
                <NutrientCircle label="Lipides" value={40} goal={64} colorClass="text-yellow-500" />
                <NutrientCircle label="Glucides" value={200} goal={386} colorClass="text-green-500" />
                <NutrientCircle label="Fibres" value={15} goal={30} colorClass="text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
             <h2 className="text-lg font-bold text-center text-red-500 mb-4">Repas de la Journée</h2>
             <Accordion type="single" collapsible className="w-full">
                {mealData.map(meal => <MealItem key={meal.name} {...meal} />)}
            </Accordion>
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  )
}
