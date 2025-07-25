
"use client"

import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookCopy, PlusCircle, Heart, Loader2 } from "lucide-react"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const savedPlans = [
  {
    title: "High-Protein Kickstart",
    description: "A plan focused on muscle gain and satiety, perfect for active individuals.",
    tags: ["High Protein", "Low Carb"],
    days: 7,
  },
  {
    title: "Mediterranean Delight",
    description: "Enjoy the flavors of the Mediterranean with this heart-healthy and delicious plan.",
    tags: ["Balanced", "Heart-Healthy"],
    days: 5,
  },
  {
    title: "Vegan Power Week",
    description: "A fully plant-based meal plan packed with nutrients and energy.",
    tags: ["Vegan", "High Fiber"],
    days: 7,
  },
  {
    title: "Quick & Easy Lunches",
    description: "A collection of simple and fast lunch ideas for a busy week.",
    tags: ["Quick Meals", "Lunch"],
    days: 5,
  },
]

export default function MealPlansPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/welcome")
      } else {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Heart />
              Favourites
            </h2>
            <p className="text-muted-foreground">
              Your collection of favorite meals.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedPlans.map((plan, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2">
                  {plan.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">{plan.days}-day plan</div>
                <Button variant="outline">View Meal</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
         <div className="pt-8 text-center text-muted-foreground">
            <p>No favorite meals yet.</p>
            <p className="text-sm">Click the heart icon on a meal to add it here.</p>
          </div>
      </div>
    </MainLayout>
  )
}

    