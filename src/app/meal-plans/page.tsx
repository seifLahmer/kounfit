
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
import { BookCopy, PlusCircle, Heart, Loader2, Frown } from "lucide-react"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getUserProfile } from "@/lib/services/userService"
import { getFavoriteMeals } from "@/lib/services/mealService"
import type { Meal, User } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"


export default function MealPlansPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [favoriteMeals, setFavoriteMeals] = useState<Meal[]>([])
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          setUser(userProfile);
          if (userProfile && userProfile.favoriteMealIds) {
            const meals = await getFavoriteMeals(userProfile.favoriteMealIds);
            setFavoriteMeals(meals);
          }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
      } else {
        router.replace("/welcome")
      }
    })
    return () => unsubscribe()
  }, [router])


  if (loading) {
    return (
     <MainLayout>
        <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
     </MainLayout>
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
        {favoriteMeals.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favoriteMeals.map((meal) => (
                <Card key={meal.id} className="flex flex-col">
                    <Link href={`/home/meal/${meal.id}`} className="block">
                        <CardHeader className="p-0">
                            <Image src={meal.imageUrl} alt={meal.name} width={400} height={200} className="rounded-t-lg object-cover w-full h-48" />
                        </CardHeader>
                        <CardContent className="flex-grow p-4 space-y-1">
                            <CardTitle className="text-lg">{meal.name}</CardTitle>
                            <CardDescription>{meal.calories} kcal &middot; {meal.price.toFixed(2)} DT</CardDescription>
                        </CardContent>
                    </Link>
                </Card>
            ))}
            </div>
        ) : (
             <div className="pt-8 text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                <Frown className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No favorite meals yet.</h3>
                <p className="text-sm">Click the heart icon on a meal to add it here.</p>
            </div>
        )}
      </div>
    </MainLayout>
  )
}
