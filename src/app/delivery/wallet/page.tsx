
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Wallet, Package, Check, Calendar } from "lucide-react";
import { getMyDeliveries } from "@/lib/services/orderService";
import type { Order } from "@/lib/types";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const DELIVERY_FEE = 7; // 7 DT per delivery

export default function DeliveryWalletPage() {
    const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchDeliveredOrders = async () => {
            const user = auth.currentUser;
            if (user) {
                setLoading(true);
                try {
                    const deliveries = await getMyDeliveries(user.uid, ["delivered"]);
                    setDeliveredOrders(deliveries);
                } catch (error: any) {
                    toast({ title: "Erreur", description: "Impossible de charger l'historique des livraisons.", variant: "destructive" });
                } finally {
                    setLoading(false);
                }
            }
        };

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchDeliveredOrders();
            }
        });
        return () => unsubscribe();
    }, [toast]);

    const totalTurnover = deliveredOrders.length * DELIVERY_FEE;

    return (
        <div className="p-4 space-y-6">
            <header className="p-4 flex items-center gap-4 bg-primary text-white rounded-lg">
                <Wallet className="w-8 h-8" />
                <h1 className="text-2xl font-bold font-heading">Mon Portefeuille</h1>
            </header>
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalTurnover.toFixed(2)} DT</div>
                                <p className="text-xs text-muted-foreground">Basé sur {deliveredOrders.length} livraisons</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Livraisons terminées</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{deliveredOrders.length}</div>
                                <p className="text-xs text-muted-foreground">Total de commandes livrées</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Historique des livraisons</h2>
                        {deliveredOrders.length > 0 ? (
                            <div className="space-y-4">
                                {deliveredOrders.map(order => (
                                    <Card key={order.id}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">Commande #{order.id.substring(0, 5)}</p>
                                                    <p className="text-sm text-muted-foreground">Client: {order.clientName}</p>
                                                </div>
                                                <div className="text-right">
                                                     <p className="font-bold text-green-600">{DELIVERY_FEE.toFixed(2)} DT</p>
                                                     <p className="text-xs text-muted-foreground capitalize">
                                                        {format(order.deliveryDate, 'd MMM yyyy', { locale: fr })}
                                                     </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                             <Card>
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    <p>Aucune livraison terminée pour le moment.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
