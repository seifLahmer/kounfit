
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
import { BookCopy, PlusCircle, Heart, Loader2, Frown, Leaf, Plus } from "lucide-react"
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
              Vos Favoris
            </h2>
            <p className="text-muted-foreground">
              Votre collection de repas préférés.
            </p>
          </div>
        </div>
        {favoriteMeals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favoriteMeals.map((meal) => (
                <Card key={meal.id} className="overflow-hidden rounded-2xl border shadow-sm flex flex-col">
                    <Link href={`/home/meal/${meal.id}`} className="block relative h-40">
                        <Image
                            src={meal.imageUrl}
                            alt={meal.name}
                            layout="fill"
                            objectFit="cover"
                            className="w-full h-full"
                            data-ai-hint="healthy food"
                        />
                    </Link>
                    <CardContent className="p-4 bg-brand-teal text-white flex-1 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-xl truncate">{meal.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Leaf className="w-4 h-4 text-green-300" />
                                <span className="font-medium">{meal.calories} kcal</span>
                            </div>
                              <div className="flex items-center gap-4 text-sm mt-2 text-green-200">
                                <span>P {meal.macros.protein}g</span>
                                <span>C {meal.macros.carbs}g</span>
                                <span>L {meal.macros.fat}g</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
            </div>
        ) : (
             <div className="pt-8 text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                <Frown className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Aucun repas favori pour l'instant.</h3>
                <p className="text-sm">Cliquez sur le cœur d'un repas pour l'ajouter ici.</p>
                 <Button className="mt-4" onClick={() => router.push('/home/add-meal/lunch')}>
                    Découvrir des repas
                </Button>
            </div>
        )}
      </div>
    </MainLayout>
  )
}
