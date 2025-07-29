
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Trash2, Loader2, Frown } from "lucide-react"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import type { Meal } from "@/lib/types"

type DailyPlan = {
    breakfast: Meal | null;
    lunch: Meal | null;
    snack: Meal | null;
    dinner: Meal | null;
};

type CartItem = Meal & { quantity: number };

export default function ShoppingCartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/welcome");
      } else {
        loadCartFromStorage();
        setLoading(false);
      }
    });

    // Listen for storage changes to keep cart in sync
    window.addEventListener('storage', loadCartFromStorage);

    return () => {
        unsubscribe();
        window.removeEventListener('storage', loadCartFromStorage);
    };
  }, [router]);

  const loadCartFromStorage = () => {
    try {
        const savedData = localStorage.getItem("dailyPlanData");
        if (savedData) {
            const { plan }: { plan: DailyPlan } = JSON.parse(savedData);
            const mealsFromPlan = Object.values(plan).filter((meal): meal is Meal => meal !== null);
            
            // Basic deduplication and quantity counting
            const items: { [id: string]: CartItem } = {};
            mealsFromPlan.forEach(meal => {
                if (items[meal.id]) {
                    items[meal.id].quantity++;
                } else {
                    items[meal.id] = { ...meal, quantity: 1 };
                }
            });

            setCartItems(Object.values(items));
        } else {
            setCartItems([]);
        }
    } catch(e) {
        console.error("Could not load cart from storage", e);
        setCartItems([]);
    }
  }

  const handleQuantityChange = (mealId: string, amount: number) => {
    const newCartItems = cartItems.map(item =>
        item.id === mealId ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
    ).filter(item => item.quantity > 0); // Keep quantity at least 1

    setCartItems(newCartItems);
    updateLocalStorage(newCartItems);
  };
  
  const handleRemoveItem = (mealId: string) => {
    const newCartItems = cartItems.filter(item => item.id !== mealId);
    setCartItems(newCartItems);
    updateLocalStorage(newCartItems);
  }

  const updateLocalStorage = (items: CartItem[]) => {
     // This logic is a bit tricky since the source of truth is the daily plan.
     // For a real app, the cart should be its own entity.
     // Here, we just clear the meal from the plan. This is a simplification.
     const savedData = localStorage.getItem("dailyPlanData");
     if (!savedData) return;

     const { date, plan } = JSON.parse(savedData);

     const updatedPlan: DailyPlan = { breakfast: null, lunch: null, dinner: null, snack: null };
     
     Object.keys(plan).forEach(key => {
         const mealType = key as keyof DailyPlan;
         const mealInPlan = plan[mealType];
         if (mealInPlan && items.some(item => item.id === mealInPlan.id)) {
             updatedPlan[mealType] = mealInPlan;
         }
     });

     localStorage.setItem("dailyPlanData", JSON.stringify({ date, plan: updatedPlan }));
  }


  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <header className="p-4 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-destructive" />
          <h1 className="text-2xl font-bold text-destructive">Votre Panier</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {cartItems.length > 0 ? (
            cartItems.map(item => (
                <Card key={item.id}>
                    <CardContent className="p-4 flex gap-4">
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={100}
                        height={100}
                        className="rounded-lg object-cover w-24 h-24"
                        data-ai-hint="healthy food"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                        <h2 className="text-lg font-semibold">{item.name}</h2>
                        <p className="text-destructive font-bold mt-1">{item.price.toFixed(2)} DT</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                            <Button
                            variant="outline"
                            size="icon"
                            className="w-7 h-7 rounded-full"
                            onClick={() => handleQuantityChange(item.id, -1)}
                            >
                            <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-bold">{item.quantity}</span>
                            <Button
                            variant="outline"
                            size="icon"
                            className="w-7 h-7 rounded-full"
                            onClick={() => handleQuantityChange(item.id, 1)}
                            >
                            <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                            <Trash2 className="w-5 h-5 text-muted-foreground" />
                        </Button>
                        </div>
                    </div>
                    </CardContent>
                </Card>
            ))
          ) : (
             <Card className="text-center p-8 text-muted-foreground">
                 <Frown className="mx-auto w-12 h-12 mb-4" />
                <h2 className="text-xl font-semibold">Votre panier est vide</h2>
                <p>Ajoutez des repas depuis la page d'accueil pour commencer.</p>
            </Card>
          )}

          {cartItems.length > 0 && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h2 className="text-lg font-bold">Résumé de la commande</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span>{subtotal.toFixed(2)} DT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxe estimée (8%)</span>
                      <span>{tax.toFixed(2)} DT</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>{total.toFixed(2)} DT</span>
                  </div>
                  <Button className="w-full bg-destructive hover:bg-destructive/90 text-white font-bold text-lg h-12">
                    Passer la commande
                  </Button>
                </CardContent>
              </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
