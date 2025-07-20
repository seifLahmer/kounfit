"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Beef, Flame, Utensils, Wheat } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MainLayout } from "@/components/main-layout"

const dailyGoals = {
  calories: 2200,
  protein: 140,
  carbs: 250,
  fat: 70,
}

const currentIntake = {
  calories: 1650,
  protein: 105,
  carbs: 180,
  fat: 55,
  meals: [
    { name: "Scrambled Eggs with Spinach", calories: 350, time: "8:00 AM" },
    { name: "Grilled Chicken Salad", calories: 500, time: "1:00 PM" },
    { name: "Greek Yogurt with Berries", calories: 200, time: "4:00 PM" },
    { name: "Salmon with Quinoa", calories: 600, time: "7:30 PM" },
  ],
}

const chartData = [
  { name: "Protein", goal: dailyGoals.protein, consumed: currentIntake.protein },
  { name: "Carbs", goal: dailyGoals.carbs, consumed: currentIntake.carbs },
  { name: "Fat", goal: dailyGoals.fat, consumed: currentIntake.fat },
]

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calories</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentIntake.calories} / {dailyGoals.calories}
              </div>
              <p className="text-xs text-muted-foreground">kcal consumed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protein</CardTitle>
              <Beef className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentIntake.protein}g / {dailyGoals.protein}g
              </div>
              <p className="text-xs text-muted-foreground">Gramms of protein</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carbs</CardTitle>
              <Wheat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentIntake.carbs}g / {dailyGoals.carbs}g
              </div>
              <p className="text-xs text-muted-foreground">Gramms of carbohydrates</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fat</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentIntake.fat}g / {dailyGoals.fat}g
              </div>
              <p className="text-xs text-muted-foreground">Gramms of fat</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Macro Goals</CardTitle>
              <CardDescription>A summary of your macronutrient intake versus your goals.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}g`}
                  />
                  <Bar
                    dataKey="consumed"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="goal"
                    fill="hsl(var(--secondary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
              <CardTitle>Today's Food Log</CardTitle>
              <CardDescription>
                You have logged {currentIntake.meals.length} meals today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meal</TableHead>
                    <TableHead>Calories</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentIntake.meals.map((meal, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{meal.name}</TableCell>
                      <TableCell>{meal.calories} kcal</TableCell>
                      <TableCell>{meal.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button className="mt-4 w-full">Add Food Item</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
