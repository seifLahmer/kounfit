
"use client"

import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { BookCopy, PlusCircle, Heart, Loader2, Frown, Leaf, Plus } from "lucide-react"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getUserProfile } from "@/lib/services/userService"
import { getFavoriteMeals } from "@/lib/services/mealService"
import type { Meal, User } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"
import { CalorieIcon } from "@/components/icons"


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
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <Heart className="text-destructive" />
              Vos Favoris
            </h2>
            <p className="text-muted-foreground">
              Votre collection de repas préférés.
            </p>
          </div>
        </div>
        {favoriteMeals.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
            {favoriteMeals.map((meal) => (
                <Card key={meal.id} className="relative overflow-hidden rounded-2xl border shadow-sm h-56 group">
                     <Link href={`/home/meal/${meal.id}`} className="absolute inset-0 z-0">
                           <Image
                                src={meal.imageUrl}
                                alt={meal.name}
                                layout="fill"
                                objectFit="cover"
                                className="w-full h-full transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint="healthy food"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        </Link>

                        <CardContent className="relative z-10 p-3 flex flex-col justify-end h-full text-white">
                            <div>
                                <h3 className="font-bold text-base truncate">{meal.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <CalorieIcon className="w-3 h-3 text-primary" />
                                    <span className="font-medium text-sm">{meal.calories} kcal</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs mt-1">
                                    <span className="font-semibold text-protein">P</span><span>{meal.macros.protein}g</span>
                                    <span className="font-semibold text-primary">C</span><span>{meal.macros.carbs}g</span>
                                    <span className="font-semibold text-fat">F</span><span>{meal.macros.fat}g</span>
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
                 <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={() => router.push('/home/add-meal/lunch')}>
                    Découvrir des repas
                </Button>
            </div>
        )}
      </div>
    </MainLayout>
  )
}
