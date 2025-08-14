"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, Share2, Clock, Star, Minus, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMealById, addMealRating } from '@/lib/services/mealService';
import type { Meal, DailyPlan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export default function MealDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [mealData, setMealData] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMeal = async () => {
      if (id) {
        try {
          setLoading(true);
          const meal = await getMealById(id);
          if (meal) {
            setMealData(meal);
          } else {
            toast({ title: "Erreur", description: "Repas non trouvé.", variant: "destructive" });
            router.push('/home');
          }
        } catch (error) {
          toast({ title: "Erreur", description: "Impossible de charger les détails du repas.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMeal();
  }, [id, router, toast]);

  const handleRatingSubmit = async (rating: number) => {
      const user = auth.currentUser;
      if (!mealData || !user) return;
      
      setIsSubmittingRating(true);
      try {
          await addMealRating(mealData.id, user.uid, rating);
          // Optimistically update the UI
          const newTotalRating = (mealData.ratings?.average || 0) * (mealData.ratings?.count || 0) + rating;
          const newRatingCount = (mealData.ratings?.count || 0) + 1;
          setMealData(prev => prev ? ({ ...prev, ratings: { average: newTotalRating / newRatingCount, count: newRatingCount } }) : null);
          toast({ title: "Merci!", description: "Votre avis a été enregistré." });
      } catch (error: any) {
           toast({ title: "Erreur", description: error.message || "Impossible de soumettre votre avis.", variant: "destructive" });
      } finally {
          setIsSubmittingRating(false);
      }
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };
  
  const handleAddToCart = () => {
    if (!mealData) return;

    try {
      const savedData = localStorage.getItem("dailyPlanData");
      const todayStr = new Date().toISOString().split('T')[0];
      
      let currentPlan: DailyPlan;
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const plan = (parsedData.date === todayStr) ? parsedData.plan : {};
        currentPlan = {
          breakfast: Array.isArray(plan.breakfast) ? plan.breakfast : [],
          lunch: Array.isArray(plan.lunch) ? plan.lunch : [],
          snack: Array.isArray(plan.snack) ? plan.snack : [],
          dinner: Array.isArray(plan.dinner) ? plan.dinner : [],
        };
      } else {
        currentPlan = { breakfast: [], lunch: [], snack: [], dinner: [] };
      }
      
      const targetMealType = mealData.category as keyof DailyPlan;
      
      if (!Array.isArray(currentPlan[targetMealType])) {
          currentPlan[targetMealType] = [];
      }
      currentPlan[targetMealType].push(mealData);
      
      localStorage.setItem("dailyPlanData", JSON.stringify({ date: todayStr, plan: currentPlan }));
      
      toast({
          title: "Repas ajouté!",
          description: `${mealData.name} a été ajouté à votre plan du jour.`,
      });
      router.push('/home');

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le repas au plan.",
        variant: "destructive",
      });
      console.error("Failed to update localStorage", error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!mealData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <p className="text-lg text-muted-foreground mb-4">Désolé, ce repas est introuvable.</p>
        <Button onClick={() => router.push('/home')}>Retour à l'accueil</Button>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <Button variant="ghost" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm" onClick={() => router.back()}>
          <ChevronLeft />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm">
          <Share2 />
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="relative h-80">
          <Image
            src={mealData.imageUrl}
            alt={mealData.name}
            layout="fill"
            objectFit="cover"
            className="rounded-b-3xl"
            data-ai-hint="grilled chicken dish"
          />
        </div>

        <div className="p-6 space-y-4">
          <h1 className="text-3xl font-bold">{mealData.name}</h1>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-destructive">{mealData.price.toFixed(2)} DT</p>
            </div>
          </div>
          
           <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">{mealData.category}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>~20 min</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>{mealData.ratings?.average.toFixed(1) || 'N/A'} ({mealData.ratings?.count || 0})</span>
              </div>
            </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{mealData.description}</p>
          </div>
          
          <div>
             <h2 className="text-xl font-semibold mb-2">Valeurs Nutritionnelles</h2>
             <div className="flex justify-around bg-muted p-4 rounded-lg">
                <div className="text-center">
                    <p className="font-bold text-lg">{mealData.calories}</p>
                    <p className="text-sm text-muted-foreground">Kcal</p>
                </div>
                <div className="text-center">
                    <p className="font-bold text-lg">{mealData.macros.protein}g</p>
                    <p className="text-sm text-muted-foreground">Protéines</p>
                </div>
                 <div className="text-center">
                    <p className="font-bold text-lg">{mealData.macros.carbs}g</p>
                    <p className="text-sm text-muted-foreground">Glucides</p>
                </div>
                 <div className="text-center">
                    <p className="font-bold text-lg">{mealData.macros.fat}g</p>
                    <p className="text-sm text-muted-foreground">Lipides</p>
                </div>
             </div>
          </div>
            
          <div>
            <h2 className="text-xl font-semibold mb-2">Évaluer ce repas</h2>
            <div 
                className="flex items-center gap-1"
                onMouseLeave={() => setHoverRating(0)}
            >
                {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-8 h-8 cursor-pointer transition-colors ${
                    (hoverRating || Math.round(mealData.ratings?.average || 0)) >= star
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                    onMouseEnter={() => setHoverRating(star)}
                    onClick={() => handleRatingSubmit(star)}
                />
                ))}
                {isSubmittingRating && <Loader2 className="w-5 h-5 ml-2 animate-spin" />}
            </div>
          </div>
        </div>
      </main>

      <footer className="p-4 border-t bg-background">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} className="rounded-full" disabled>
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)} className="rounded-full" disabled>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
          <Button size="lg" className="w-1/2 bg-destructive hover:bg-destructive/90 rounded-full" onClick={handleAddToCart}>
            Ajouter au plan
          </Button>
        </div>
      </footer>
    </div>
  );
}
