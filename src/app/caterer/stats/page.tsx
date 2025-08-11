
"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ArrowUp, Star } from "lucide-react"

// Mock data - replace with actual data fetching logic
const revenueData = [
  { name: 'Lun', value: 120 },
  { name: 'Mar', value: 180 },
  { name: 'Mer', value: 150 },
  { name: 'Jeu', value: 220 },
  { name: 'Ven', value: 250 },
  { name: 'Sam', value: 310 },
  { name: 'Dim', value: 290 },
]

const mostOrderedMeals = [
  { name: "Poulet grillé", count: 120, image: "https://placehold.co/40x40.png" },
  { name: "Bœuf teriyaki", count: 105, image: "https://placehold.co/40x40.png" },
  { name: "Saumon rôti", count: 84, image: "https://placehold.co/40x40.png" },
  { name: "Salade de quinoa", count: 76, image: "https://placehold.co/40x40.png" },
  { name: "Pâtes de courgette", count: 63, image: "https://placehold.co/40x40.png" },
]

const bestRatedMeals = [
    { name: "Grillée chicken", rating: 5, image: "https://placehold.co/40x40.png" },
    { name: "Salade de quinoa", rating: 4, image: "https://placehold.co/40x40.png" },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

export default function StatsPage() {
    const [timeframe, setTimeframe] = useState("mois")
  return (
    <div className="bg-tertiary">
      <header className="p-4 pt-8 text-white">
        <h1 className="text-3xl font-bold font-serif">Statistiques</h1>
      </header>

      <main className="bg-background rounded-t-3xl p-4 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>Revenue</CardTitle>
                <div className="flex items-center gap-1 bg-muted p-1 rounded-full">
                    <Button 
                        size="sm" 
                        variant={timeframe === 'jour' ? 'default' : 'ghost'} 
                        onClick={() => setTimeframe('jour')}
                        className="rounded-full h-8 px-4"
                    >
                        Jour
                    </Button>
                    <Button 
                        size="sm" 
                        variant={timeframe === 'mois' ? 'default' : 'ghost'} 
                        onClick={() => setTimeframe('mois')}
                        className="rounded-full h-8 px-4"
                    >
                        Mois
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
               <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <Tooltip
                          content={<ChartTooltipContent hideIndicator />}
                          cursor={{ stroke: 'hsl(var(--destructive))', strokeWidth: 2, strokeDasharray: "3 3" }}
                       />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--destructive))" strokeWidth={3} dot={false} />
                      </LineChart>
                  </ResponsiveContainer>
               </ChartContainer>
            </div>
            <div className="flex items-baseline gap-4 mt-4">
                <p className="text-3xl font-bold">2560 DT</p>
                <div className="flex items-center text-green-500 font-semibold">
                    <ArrowUp className="w-4 h-4"/>
                    <span>8.2%</span>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Repas les plus commandés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {mostOrderedMeals.map(meal => (
                    <div key={meal.name} className="flex items-center gap-4">
                        <Image src={meal.image} alt={meal.name} width={40} height={40} className="rounded-md" data-ai-hint="caterer meal" />
                        <div className="flex-1">
                            <p className="font-medium">{meal.name}</p>
                            <Progress value={(meal.count / mostOrderedMeals[0].count) * 100} className="h-2 mt-1" indicatorClassName="bg-primary" />
                        </div>
                        <p className="font-semibold">{meal.count}</p>
                    </div>
                ))}
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Repas les mieux notés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {bestRatedMeals.map(meal => (
                    <div key={meal.name} className="flex items-center gap-4">
                        <Image src={meal.image} alt={meal.name} width={40} height={40} className="rounded-md" data-ai-hint="caterer meal" />
                        <p className="flex-1 font-medium">{meal.name}</p>
                        <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-5 h-5 ${i < meal.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
      </main>
    </div>
  )
}
