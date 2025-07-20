"use client"

import { useState } from "react"
import { Bell, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MainLayout } from "@/components/main-layout"
import { format } from "date-fns"

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
          <CardContent className="p-4">
            <h2 className="text-lg font-bold text-center text-red-500 mb-2">Statistiques du Jour</h2>
            <p className="text-center font-semibold text-lg mb-4">Apport Calorique</p>
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  className="stroke-current text-gray-200"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-4xl font-bold">0</p>
                <p className="text-muted-foreground">/ 2759 kcal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}