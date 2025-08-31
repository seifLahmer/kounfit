
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2, Frown, CheckCircle, Trash2, MapPin } from "lucide-react"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import type { Meal, DailyPlan, User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { placeOrder } from "@/lib/services/orderService"
import { getUserProfile, updateUserProfile } from "@/lib/services/userService"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import LocationPicker from "@/components/location-picker"


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
    try {
        const savedData = localStorage.getItem("dailyPlanData");
        if (savedData) {
            const { date, plan } = JSON.parse(savedData);
            if (date !== new Date().toISOString().split('T')[0]) {
                localStorage.removeItem("dailyPlanData");
                setCartItems([]);
                return;
            }
            
            const mealsFromPlan: Meal[] = Object.values(plan).flat() as Meal[];
            
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
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    }
  }, [router]);
  
  const handleRemoveItem = (mealId: string) => {
    try {
        const savedData = localStorage.getItem("dailyPlanData");
        if (savedData) {
            const { date, plan } = JSON.parse(savedData);
            const newPlan: DailyPlan = { breakfast: [], lunch: [], dinner: [], snack: [] };

            let itemRemoved = false;
            for (const key in plan) {
                const mealType = key as keyof DailyPlan;
                const meals = plan[mealType] as Meal[];
                const indexToRemove = meals.findIndex(m => m.id === mealId);
                
                if (indexToRemove > -1 && !itemRemoved) {
                    newPlan[mealType] = [...meals.slice(0, indexToRemove), ...meals.slice(indexToRemove + 1)];
                    itemRemoved = true;
                } else {
                    newPlan[mealType] = meals;
                }
            }
             for (const key in newPlan) {
                   const mealType = key as keyof DailyPlan;
                   newPlan[mealType] = (newPlan[mealType] as Meal[]).filter(m => m.id !== mealId);
                }
            
            localStorage.setItem("dailyPlanData", JSON.stringify({ date, plan: newPlan }));
            loadCartFromStorage();
        }
    } catch (e) {
        console.error("Error removing item", e);
        toast({ title: "Erreur", description: "Impossible de retirer l'article."})
    }
  };

  const handleLocationSelect = async (address: string, region: string) => {
    if (userProfile && region.toLowerCase() !== userProfile.region.toLowerCase()) {
        toast({
            title: "Région incompatible",
            description: `Cette adresse est dans la région de ${region}, mais votre profil est configuré pour ${userProfile.region}. Veuillez changer la région de votre profil pour commander ici.`,
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
            toast({ title: "Erreur", description: "Impossible de sauvegarder l'adresse.", variant: "destructive" });
        }
    }
    setIsLocationSheetOpen(false);
};


  const handlePlaceOrder = async () => {
      const user = auth.currentUser;
      if (!user || !userProfile || cartItems.length === 0) return;

      setIsPlacingOrder(true);
      try {
          if (!deliveryAddress) {
            toast({
                title: "Adresse de livraison manquante",
                description: "Veuillez sélectionner une adresse de livraison sur la carte.",
                variant: "destructive",
            });
            setIsPlacingOrder(false);
            return;
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
          
          localStorage.removeItem("dailyPlanData");
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
  const deliveryFee = 2.00;
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
            cartItems.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-lg object-cover w-16 h-16"
                        data-ai-hint="healthy food"
                    />
                    <div className="flex-1">
                        <h2 className="font-semibold">{item.name}</h2>
                        <p className="text-secondary font-bold">{item.price.toFixed(2)} DT</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="font-bold">{item.quantity}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                        <Trash2 className="w-5 h-5 text-secondary"/>
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
                    <Label htmlFor="deliveryAddress">Adresse de livraison <span className="text-xs text-muted-foreground">(la localisation doit etre appartient au region selectionner si non la commande ne sera pas traiter)</span></Label>
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
                                <SheetDescription>Déplacez la carte pour positionner le marqueur sur votre adresse de livraison exacte.</SheetDescription>
                            </SheetHeader>
                            <div className="flex-grow">
                                <LocationPicker 
                                    initialAddress={deliveryAddress}
                                    onLocationSelect={handleLocationSelect} 
                                    onClose={() => setIsLocationSheetOpen(false)} 
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="space-y-2 text-muted-foreground">
                    <div className="flex justify-between">
                        <span>Sous-total</span>
                        <span>{subtotal.toFixed(2)} DT</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Frais de livraison</span>
                        <span>{deliveryFee.toFixed(2)} DT</span>
                    </div>
                </div>
                <Separator className="my-4"/>
                <div className="flex justify-between font-bold text-xl pt-2">
                    <span>Total</span>
                    <span>{total.toFixed(2)} DT</span>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-muted-foreground bg-gray-100 rounded-full p-2 mt-4 max-w-xs mx-auto">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>30-35 min</span>
                </div>
              </div>
          )}
        </div>
        {cartItems.length > 0 && (
             <footer className="p-4 bg-white border-t mb-8">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg h-14 rounded-button"
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
                    {isPlacingOrder ? "Envoi en cours..." : "Confirmer la commande"}
                  </Button>
             </footer>
         )}
      </div>
    </MainLayout>
  )
}
