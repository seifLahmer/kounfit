
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Loader2, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAvailableMealsByCategory } from "@/lib/services/mealService";
import type { Meal } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function AddMealPage() {
  const router = useRouter();
  const params = useParams();
  const mealType = Array.isArray(params.mealType) ? params.mealType[0] : params.mealType;

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (mealType) {
      const fetchMeals = async () => {
        try {
          setLoading(true);
          const fetchedMeals = await getAvailableMealsByCategory(mealType as Meal['category']);
          setMeals(fetchedMeals);
        } catch (error) {
          toast({
            title: "Erreur",
            description: "Impossible de charger les repas disponibles.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchMeals();
    }
  }, [mealType, toast]);
  
  const handleAddMeal = (meal: Meal) => {
    // TODO: Implement logic to add the meal to the user's daily plan
    toast({
        title: "Repas Ajouté!",
        description: `${meal.name} a été ajouté à votre ${mealType}.`,
    });
    router.push('/home');
  };

  const filteredMeals = meals.filter((meal) =>
    meal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft />
        </Button>
        <h1 className="text-xl font-bold capitalize">
            Ajouter {mealType === 'snack' ? 'une Collation' : `un ${mealType}`}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Rechercher un plat..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : filteredMeals.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
                {filteredMeals.map((meal) => (
                    <Card key={meal.id} className="overflow-hidden">
                        <div className="flex">
                            <Image
                                src={meal.imageUrl}
                                alt={meal.name}
                                width={120}
                                height={120}
                                className="object-cover"
                                data-ai-hint="healthy food"
                            />
                            <div className="flex flex-col p-4 flex-1">
                                <CardTitle className="text-lg">{meal.name}</CardTitle>
                                <CardDescription>{meal.calories} kcal</CardDescription>
                                <CardFooter className="p-0 mt-auto flex justify-end">
                                     <Button size="sm" className="bg-destructive hover:bg-destructive/90" onClick={() => handleAddMeal(meal)}>
                                         <PlusCircle className="w-4 h-4 mr-2"/>
                                         Ajouter
                                     </Button>
                                </CardFooter>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        ) : (
             <div className="text-center text-muted-foreground py-16">
                <p className="font-semibold text-lg">Aucun repas trouvé</p>
                <p>Aucun repas n'est disponible pour cette catégorie ou votre recherche.</p>
            </div>
        )}
      </main>
    </div>
  );
}

