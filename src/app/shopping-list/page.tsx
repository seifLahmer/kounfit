
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Loader2, Frown, CheckCircle, MapPin } from "lucide-react"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import type { Meal, User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { placeOrder } from "@/lib/services/orderService"
import { getUserProfile } from "@/lib/services/userService"
import { cn } from "@/lib/utils"


type DailyPlan = {
    breakfast: Meal | null;
    lunch: Meal | null;
    snack: Meal | null;
    dinner: Meal | null;
};

type CartItem = Meal & { quantity: number };

export default function ShoppingCartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace("/welcome");
      } else {
        loadCartFromStorage();
        try {
            const userProfile = await getUserProfile(user.uid);
            // Check for address from local storage first (set by map page)
            const selectedAddress = localStorage.getItem('selectedDeliveryAddress');
            if (selectedAddress) {
                setDeliveryAddress(selectedAddress);
                localStorage.removeItem('selectedDeliveryAddress'); // Clean up
            } else if (userProfile?.deliveryAddress) {
                setDeliveryAddress(userProfile.deliveryAddress);
            }
        } catch (error) {
            console.error("Failed to load user profile for address", error)
        }
        setLoading(false);
      }
    });

    const handleStorageChange = () => loadCartFromStorage();
    window.addEventListener('storage', handleStorageChange);

    return () => {
        unsubscribe();
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  const loadCartFromStorage = () => {
    try {
        const savedData = localStorage.getItem("dailyPlanData");
        if (savedData) {
            const { plan }: { plan: DailyPlan } = JSON.parse(savedData);
            const mealsFromPlan = Object.values(plan).filter((meal): meal is Meal => meal !== null);
            
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

  const handlePlaceOrder = async () => {
      const user = auth.currentUser;
      if (!user || cartItems.length === 0) return;
      
      if (!deliveryAddress.trim()) {
        toast({
            title: "Adresse manquante",
            description: "Veuillez choisir une adresse de livraison sur la carte.",
            variant: "destructive",
        });
        return;
      }

      setIsPlacingOrder(true);
      try {
          const userProfile = await getUserProfile(user.uid);
          if (!userProfile) {
              throw new Error("Profil utilisateur non trouvé.");
          }

          await placeOrder({
              clientId: user.uid,
              clientName: userProfile.fullName,
              clientRegion: userProfile.region || 'Non spécifiée',
              deliveryAddress: deliveryAddress,
              items: cartItems.map(item => ({
                  mealId: item.id,
                  mealName: item.name,
                  quantity: item.quantity,
                  unitPrice: item.price,
                  catererId: item.createdBy,
              })),
              totalPrice: total,
          });

          toast({
              title: "Commande passée avec succès!",
              description: "Votre commande a été envoyée au traiteur.",
              action: <CheckCircle className="text-green-500" />,
          });
          
          setCartItems([]);
          
      } catch (error) {
          toast({
              title: "Erreur",
              description: "Impossible de passer la commande. Veuillez réessayer.",
              variant: "destructive",
          });
          console.error(error);
      } finally {
          setIsPlacingOrder(false);
      }
  };


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
                    <CardContent className="p-4 flex gap-4 items-center">
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
                            <p className="text-muted-foreground text-sm">Quantité : {item.quantity}</p>
                        </div>
                        <p className="text-destructive font-bold mt-2">{item.price.toFixed(2)} DT</p>
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
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Adresse de livraison</label>
                      <button 
                        className="w-full text-left p-3 border rounded-md flex items-center gap-3 hover:bg-muted"
                        onClick={() => router.push('/home/set-location')}
                      >
                         <MapPin className="w-5 h-5 text-destructive"/>
                         <span className={cn("truncate", !deliveryAddress && "text-muted-foreground")}>
                            {deliveryAddress || "Choisir sur la carte"}
                         </span>
                      </button>
                   </div>
                  <div className="flex justify-between font-bold text-xl pt-2">
                    <span>Total</span>
                    <span>{total.toFixed(2)} DT</span>
                  </div>
                  <Button 
                    className="w-full bg-destructive hover:bg-destructive/90 text-white font-bold text-lg h-12"
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
                    {isPlacingOrder ? "Envoi en cours..." : "Passer la commande"}
                  </Button>
                </CardContent>
              </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
