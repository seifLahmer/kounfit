"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Frown, CheckCircle, Trash2, MapPin } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import type { Meal, DailyPlan, User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { placeOrder } from "@/lib/services/orderService";
import { getUserProfile, updateUserProfile } from "@/lib/services/userService";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import LocationPicker from "@/components/location-picker";
import { getMealById } from "@/lib/services/mealService";

type CartItem = Meal & { quantity: number };

export default function ShoppingCartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const { toast } = useToast();
  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);

  const loadCartFromStorage = () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    try {
      const savedData = localStorage.getItem(`dailyPlanData_${firebaseUser.uid}`);
      const prevRegion = localStorage.getItem(`region_${firebaseUser.uid}`);
      const currentRegion = userProfile?.region;

      if (savedData && prevRegion && currentRegion && prevRegion !== currentRegion) {
        localStorage.removeItem(`dailyPlanData_${firebaseUser.uid}`);
        setCartItems([]);
        toast({
          title: "Région modifiée",
          description: "Votre panier a été réinitialisé car votre région a changé.",
        });
        localStorage.setItem(`region_${firebaseUser.uid}`, currentRegion);
        return;
      }

      if (savedData) {
        const { date, plan } = JSON.parse(savedData);

        if (date !== new Date().toISOString().split("T")[0]) {
          localStorage.removeItem(`dailyPlanData_${firebaseUser.uid}`);
          setCartItems([]);
          return;
        }

        const mealsFromPlan: Meal[] = Object.values(plan).flat() as Meal[];
        const validMeals = mealsFromPlan.filter(
          (meal) => meal && typeof meal === "object" && meal.id
        );

        const items: { [id: string]: CartItem } = {};
        validMeals.forEach((meal) => {
          if (items[meal.id]) {
            items[meal.id].quantity++;
          } else {
            items[meal.id] = { ...meal, quantity: 1 };
          }
        });

        setCartItems(Object.values(items));

        if (currentRegion) {
          localStorage.setItem(`region_${firebaseUser.uid}`, currentRegion);
        }
      } else {
        setCartItems([]);
      }
    } catch (e) {
      console.error("Could not load cart from storage", e);
      setCartItems([]);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace("/welcome");
      } else {
        setLoading(true);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        if (profile?.deliveryAddress) {
          setDeliveryAddress(profile.deliveryAddress);
        }
        loadCartFromStorage();
        setLoading(false);
      }
    });

    const handleStorageChange = () => loadCartFromStorage();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router]);

  const handleRemoveItem = (mealId: string) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    const storageKey = `dailyPlanData_${firebaseUser.uid}`;

    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const { date, plan } = JSON.parse(savedData);
        const newPlan: DailyPlan = { breakfast: [], lunch: [], dinner: [], snack: [] };

        for (const key in plan) {
          const mealType = key as keyof DailyPlan;
          newPlan[mealType] = (plan[mealType] as Meal[]).filter((m) => m && m.id !== mealId);
        }

        localStorage.setItem(storageKey, JSON.stringify({ date, plan: newPlan }));
        loadCartFromStorage();
      }
    } catch (e) {
      console.error("Error removing item", e);
      toast({ title: "Erreur", description: "Impossible de retirer l'article." });
    }
  };

  const handleLocationSelect = async (address: string, region: string) => {
    if (userProfile && region.toLowerCase() !== userProfile.region.toLowerCase()) {
      toast({
        title: "Région incompatible",
        description: `Cette adresse est dans la région de ${region}, mais votre profil est configuré pour ${userProfile.region}.`,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    setDeliveryAddress(address);
    if (userProfile) {
      try {
        await updateUserProfile(userProfile.uid, { deliveryAddress: address });
        toast({ title: "Adresse enregistrée!" });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder l'adresse.",
          variant: "destructive",
        });
      }
    }
    setIsLocationSheetOpen(false);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = 7.0;
  const total = subtotal + deliveryFee;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-tertiary text-white">
        <header className="p-4 flex items-center justify-between">
          <Image src="/kounfit/kounfit white.png" alt="Kounfit Logo" width={120} height={30} />
        </header>

        <div className="flex-1 overflow-y-auto bg-white text-black rounded-t-3xl p-6 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="rounded-lg object-cover w-16 h-16"
                />
                <div className="flex-1">
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-secondary font-bold">{item.price.toFixed(2)} DT</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{item.quantity}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                  <Trash2 className="w-5 h-5 text-secondary" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              <Frown className="mx-auto w-12 h-12 mb-4" />
              <h2 className="text-xl font-semibold font-heading">Votre panier est vide</h2>
              <p>Ajoutez des repas depuis la page d'accueil pour commencer.</p>
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Adresse de livraison</Label>
                <Sheet open={isLocationSheetOpen} onOpenChange={setIsLocationSheetOpen}>
                  <SheetTrigger asChild>
                    <Card className="mt-2 cursor-pointer hover:bg-muted">
                      <CardContent className="p-3 flex items-center gap-3">
                        <MapPin className="text-primary" />
                        <span className="text-sm truncate">
                          {deliveryAddress || "Sélectionner une adresse sur la carte"}
                        </span>
                      </CardContent>
                    </Card>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[90vh] p-0 flex flex-col">
                    <SheetHeader className="p-4 border-b shrink-0">
                      <SheetTitle>Sélectionnez votre adresse</SheetTitle>
                      <SheetDescription>
                        Déplacez la carte pour positionner le marqueur sur votre adresse de
                        livraison exacte.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1">
                      <LocationPicker onSelect={handleLocationSelect} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)} DT</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de livraison</span>
                <span>{deliveryFee.toFixed(2)} DT</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{total.toFixed(2)} DT</span>
              </div>
              <Button onClick={() => {}} disabled={isPlacingOrder} className="w-full">
                {isPlacingOrder ? "Commande en cours..." : "Passer la commande"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
