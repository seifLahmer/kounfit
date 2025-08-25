
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, MapPin, Frown, Bike, Check, Package } from "lucide-react";
import { updateOrderStatus } from "@/lib/services/orderService";
import type { Order, DeliveryPerson } from "@/lib/types";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc } from 'firebase/firestore';
import { Separator } from "@/components/ui/separator";

export default function DeliveryDashboardPage() {
    const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
    const [myDeliveries, setMyDeliveries] = useState<Order[]>([]);
    const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchDeliveryData = async () => {
        const user = auth.currentUser;
        if (user) {
            setLoading(true);
            try {
                const deliveryDocRef = doc(db, 'deliveryPeople', user.uid);
                const deliverySnap = await getDoc(deliveryDocRef);
                if (deliverySnap.exists()) {
                    const person = { uid: deliverySnap.id, ...deliverySnap.data() } as DeliveryPerson;
                    setDeliveryPerson(person);

                    // Fetch orders using the API route
                    const response = await fetch('/api/delivery/orders', {
                        headers: {
                            'X-User-Id': user.uid,
                            'X-User-Region': person.region,
                        }
                    });

                    const responseData = await response.json();

                    if (!response.ok) {
                        throw new Error(responseData.error || 'Failed to fetch orders from API');
                    }
                    
                    setAvailableOrders(responseData.availableOrders);
                    setMyDeliveries(responseData.myDeliveries);

                } else {
                    toast({ title: "Erreur", description: "Profil livreur non trouvé.", variant: "destructive" });
                }
            } catch (error: any) {
                console.error(error);
                toast({ title: "Erreur", description: error.message || "Impossible de charger les données.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchDeliveryData();
            }
        });
        return () => unsubscribe();
    }, []);

    const handleAcceptDelivery = async (orderId: string) => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            await updateOrderStatus(orderId, 'in_delivery', user.uid);
            toast({ title: "Livraison acceptée", description: "La commande est maintenant dans votre liste 'Mes Livraisons'." });
            fetchDeliveryData(); // Refresh list
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de mettre à jour la commande.", variant: "destructive" });
        }
    };

     const handleCompleteDelivery = async (orderId: string) => {
        try {
            await updateOrderStatus(orderId, 'delivered');
            toast({ title: "Livraison terminée!", description: "La commande a été marquée comme livrée.", action: <Check className="text-green-500"/> });
            fetchDeliveryData(); // Refresh list
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de finaliser la livraison.", variant: "destructive" });
        }
    };
    
    const OrderCard = ({ order, onAction, buttonText, buttonIcon }: { order: Order, onAction: (id: string) => void, buttonText: string, buttonIcon: React.ReactNode }) => (
         <Card key={order.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Commande #{order.id.substring(0, 5)}</CardTitle>
                <span className="font-bold text-primary">{order.totalPrice.toFixed(2)} DT</span>
            </CardHeader>
            <CardContent>
                <div className="flex items-start gap-4">
                     <Avatar>
                        <AvatarFallback>{order.clientName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold">{order.clientName}</p>
                        <div className="flex items-center text-sm text-muted-foreground gap-2 mt-1">
                            <MapPin className="w-4 h-4" />
                            <span>{order.deliveryAddress}</span>
                        </div>
                    </div>
                </div>
                <Button className="w-full mt-4 bg-secondary hover:bg-secondary/90" onClick={() => onAction(order.id)}>
                   {buttonIcon} {buttonText}
                </Button>
            </CardContent>
        </Card>
    );
    
    return (
        <div className="p-4 space-y-6">
             <header className="p-4 flex justify-between items-center bg-primary text-white rounded-lg">
                <h1 className="text-2xl font-bold font-heading">Interface Livreur</h1>
                <Bike />
            </header>
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold mb-3">Mes Livraisons</h2>
                        {myDeliveries.length > 0 ? (
                             myDeliveries.map(order => (
                                <OrderCard 
                                    key={order.id} 
                                    order={order} 
                                    onAction={handleCompleteDelivery} 
                                    buttonText="Marquer comme livrée"
                                    buttonIcon={<Check className="mr-2 h-4 w-4" />}
                                />
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">Vous n'avez aucune livraison en cours.</p>
                        )}
                    </div>
                    
                    <Separator />
                    
                    <div>
                        <h2 className="text-xl font-bold mb-3">Commandes Disponibles</h2>
                         {availableOrders.length > 0 ? (
                            availableOrders.map(order => (
                               <OrderCard 
                                    key={order.id} 
                                    order={order} 
                                    onAction={handleAcceptDelivery} 
                                    buttonText="Accepter la livraison"
                                    buttonIcon={<Package className="mr-2 h-4 w-4" />}
                                />
                            ))
                         ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                    <Frown className="w-12 h-12 mb-4"/>
                                    <p className="text-lg font-semibold">Aucune commande disponible</p>
                                    <p className="text-center text-sm">Il n'y a pas de commandes prêtes pour la livraison dans votre région pour le moment.</p>
                                </CardContent>
                            </Card>
                         )}
                    </div>
                </div>
            )}
        </div>
    )
}
