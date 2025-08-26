
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, MapPin, Frown, Bike, Check } from "lucide-react";
import { updateOrderStatus, getMyDeliveries } from "@/lib/services/orderService";
import type { Order, DeliveryPerson } from "@/lib/types";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc } from 'firebase/firestore';

export default function DeliveryDashboardPage() {
    const [activeDeliveries, setActiveDeliveries] = useState<Order[]>([]);
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

                    // Fetch only active deliveries for the dashboard
                    const deliveries = await getMyDeliveries(user.uid, ["ready_for_delivery", "in_delivery"]);
                    setActiveDeliveries(deliveries);

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

     const handleCompleteDelivery = async (orderId: string) => {
        try {
            await updateOrderStatus(orderId, 'delivered');
            toast({ title: "Livraison terminée!", description: "La commande a été marquée comme livrée.", action: <Check className="text-green-500"/> });
            fetchDeliveryData(); // Refresh list
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de finaliser la livraison.", variant: "destructive" });
        }
    };
    
    const OrderCard = ({ order }: { order: Order }) => (
         <Card key={order.id} className="mb-4">
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
                <Button className="w-full mt-4 bg-secondary hover:bg-secondary/90" onClick={() => handleCompleteDelivery(order.id)}>
                   <Check className="mr-2 h-4 w-4" /> Marquer comme livrée
                </Button>
            </CardContent>
        </Card>
    );
    
    return (
        <div className="p-4 space-y-6">
             <header className="p-4 flex justify-between items-center bg-primary text-white rounded-lg">
                <h1 className="text-2xl font-bold font-heading">Mes Livraisons</h1>
                <Bike />
            </header>
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        {activeDeliveries.length > 0 ? (
                             activeDeliveries.map(order => <OrderCard key={order.id} order={order} />)
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                    <Frown className="w-12 h-12 mb-4"/>
                                    <p className="text-lg font-semibold">Aucune commande assignée</p>
                                    <p className="text-center text-sm">Vous n'avez pas de livraison en cours pour le moment.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
