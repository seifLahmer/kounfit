
"use client"

import { useState } from "react"
import { Bell, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/main-layout"
import { addDays, format, startOfWeek } from "date-fns"
import { fr } from "date-fns/locale"

const CalorieCircle = ({ value, goal }: { value: number, goal: number }) => {
  const percentage = goal > 0 ? (value / goal) * 100 : 0
  const circumference = 2 * Math.PI * 56
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="stroke-current text-gray-200 dark:text-gray-700"
          strokeWidth="8"
          fill="none"
          cx="60"
          cy="60"
          r="56"
        />
        <circle
          className="stroke-current text-red-500"
          strokeWidth="8"
          fill="none"
          cx="60"
          cy="60"
          r="56"
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ strokeDasharray: circumference, strokeDashoffset, transition: "stroke-dashoffset 0.5s ease-in-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">/ {goal} kcal</p>
      </div>
    </div>
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
            <CardTitle className="text-lg font-bold text-red-500 text-center">
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
                    variant={format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd") ? "destructive" : "ghost"}
                    size="icon"
                    className="w-10 h-10 rounded-full"
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
            <CardTitle className="text-lg font-bold text-red-500 text-center">
              Statistiques du Jour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center font-semibold">Apport Calorique</p>
            <CalorieCircle value={0} goal={2759} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
