
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell, ChefHat, PlusCircle, Loader2, Trash2, CheckCircle, Edit2, MoreHorizontal, Utensils, ClipboardList, Bike } from "lucide-react";
import { getMealsByCaterer, deleteMeal } from "@/lib/services/mealService";
import { getOrdersByCaterer, updateOrderStatus } from "@/lib/services/orderService";
import { getAllDeliveryPeople } from "@/lib/services/deliveryService";
import type { Meal, Order, Caterer, DeliveryPerson } from "@/lib/types";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge';
import { doc, getDoc } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';

export default function CatererPage() {
  const [caterer, setCaterer] = useState<Caterer | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [availableDeliveryPeople, setAvailableDeliveryPeople] = useState<DeliveryPerson[]>([]);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchCatererData = async () => {
    const user = auth.currentUser;
    if (user) {
        setLoading(true);
        try {
            const catererDocRef = doc(db, 'caterers', user.uid);
            const catererSnap = await getDoc(catererDocRef);
             if (!catererSnap.exists()) {
                throw new Error("Profil traiteur non trouvé.");
            }
            const catererData = catererSnap.data() as Caterer;
            setCaterer(catererData);

            const [fetchedMeals, receivedOrders, allDeliveryPeople] = await Promise.all([
              getMealsByCaterer(user.uid),
              getOrdersByCaterer(user.uid),
              getAllDeliveryPeople(),
            ]);
            
            setMeals(fetchedMeals);
            setOrders(receivedOrders);

            const deliveryInRegion = allDeliveryPeople.filter(
                person => person.region === catererData.region && person.status === 'approved'
            );
            setAvailableDeliveryPeople(deliveryInRegion);

        } catch (error: any) {
            toast({ title: "Erreur", description: error.message || "Impossible de charger vos données.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        if(user) {
            fetchCatererData();
        }
    });
    return () => unsubscribe();
  }, []);
  
  const handleDeleteMeal = async (meal: Meal) => {
    if (!meal) return;
    try {
      await deleteMeal(meal.id, meal.imageRef);
      toast({
        title: "Repas supprimé",
        description: `${meal.name} a été retiré.`,
      });
      fetchCatererData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le repas.",
        variant: "destructive",
      });
    }
  };
  
  const handleStatusChange = async (orderId: string, newStatus: Order['status'], deliveryPersonId?: string) => {
    try {
        await updateOrderStatus(orderId, newStatus, deliveryPersonId);
        setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? {...o, status: newStatus, deliveryPersonId} : o));
        toast({ title: "Statut mis à jour", description: `La commande est maintenant "${newStatus}".` });
    } catch(error) {
        toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
    }
  };
  
  const handleAssignDelivery = (orderId: string) => {
    if (!selectedDeliveryPerson) {
        toast({ title: "Aucun livreur sélectionné", description: "Veuillez choisir un livreur.", variant: "destructive"});
        return;
    }
    handleStatusChange(orderId, 'ready_for_delivery', selectedDeliveryPerson);
    setSelectedDeliveryPerson(null);
  };


  const { pendingOrders, inPreparationOrders, readyForDeliveryOrders, deliveredOrders } = useMemo(() => {
    return {
      pendingOrders: orders.filter(o => o.status === 'pending'),
      inPreparationOrders: orders.filter(o => o.status === 'in_preparation'),
      readyForDeliveryOrders: orders.filter(o => o.status === 'ready_for_delivery'),
      deliveredOrders: orders.filter(o => o.status === 'delivered')
    }
  }, [orders]);
  
  const OrderCard = ({ order }: { order: Order }) => {
    
    const getButtonAction = () => {
      switch(order.status) {
        case 'pending':
          return { 
            text: 'Préparer', 
            action: () => handleStatusChange(order.id, 'in_preparation'), 
            className: 'bg-primary hover:bg-primary/90' 
          };
        case 'in_preparation':
          return { 
            text: 'Prêt (Choisir livreur)', 
            action: () => {}, // Handled by Dialog trigger
            className: 'bg-blue-500 hover:bg-blue-600',
            isDialog: true
          };
        case 'ready_for_delivery':
          return { 
            text: 'En attente du livreur', 
            action: () => {}, 
            className: 'bg-yellow-500', 
            disabled: true 
          };
        case 'delivered':
           return { 
             text: 'Détails', 
             action: () => {}, 
             className: 'bg-gray-500 hover:bg-gray-600' 
            };
        default:
          return { 
            text: 'Détails', 
            action: () => {}, 
            className: 'bg-gray-500 hover:bg-gray-600' 
          };
      }
    };
    
    const { text, action, className, disabled, isDialog } = getButtonAction();

    const cardButton = (
        <Button onClick={action} className={`w-full ${className} text-white rounded-lg`} disabled={disabled}>{text}</Button>
    );

    return (
      <Card className="w-64 shrink-0 shadow-lg transition-transform duration-300 hover:scale-105">
        <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={`https://placehold.co/40x40.png`} />
                <AvatarFallback>{order.clientName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{order.clientName}</span>
            </div>
            <div className="text-sm text-muted-foreground min-h-[40px]">
              {order.items.slice(0, 2).map(item => (
                <p key={item.mealId}>{item.quantity}x {item.mealName}</p>
              ))}
            </div>
            
            {order.status === 'pending' && <Badge variant="secondary">À préparer</Badge>}
            {order.status === 'in_preparation' && <Badge className="bg-blue-100 text-blue-800">En cours</Badge>}
            {order.status === 'ready_for_delivery' && <Badge className="bg-yellow-100 text-yellow-800">Prêt</Badge>}
            {order.status === 'delivered' && <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Livrée</Badge>}
            
            <p className="font-bold text-lg">{order.totalPrice.toFixed(2)} DT</p>

            {isDialog ? (
                <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedDeliveryPerson(null)}>
                    <DialogTrigger asChild>{cardButton}</DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Assigner un livreur</DialogTitle>
                        <DialogDescription>
                            Choisissez un livreur disponible pour la commande #{order.id.substring(0, 5)}.
                        </DialogDescription>
                        </DialogHeader>
                        {availableDeliveryPeople.length > 0 ? (
                        <Select onValueChange={setSelectedDeliveryPerson}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un livreur..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableDeliveryPeople.map(person => (
                                    <SelectItem key={person.uid} value={person.uid}>
                                        {person.name} ({person.vehicleType})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Aucun livreur approuvé trouvé dans votre région.
                            </p>
                        )}
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button onClick={() => handleAssignDelivery(order.id)} disabled={!selectedDeliveryPerson || availableDeliveryPeople.length === 0}>
                                    <Bike className="mr-2 h-4 w-4" /> Assigner
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : cardButton}

        </CardContent>
      </Card>
    )
  };

  return (
    <div className="bg-primary min-h-screen">
      <header className="p-4 flex justify-between items-center text-white">
        <h1 className="text-2xl font-bold font-heading">KOUNFIT</h1>
        <Button variant="ghost" size="icon">
          <Bell />
        </Button>
      </header>
      <main className="bg-background rounded-t-3xl p-4 space-y-6">
        <h2 className="text-2xl font-bold">Interface Traiteur</h2>
        <Tabs defaultValue="commandes">
          <TabsList className="grid w-full grid-cols-2 bg-gray-200 rounded-full">
            <TabsTrigger value="commandes" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">Commandes</TabsTrigger>
            <TabsTrigger value="repas" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">Mes Repas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="commandes" className="space-y-6 pt-4">
             {loading ? (
                <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin text-primary" /></div>
             ) : (
             <>
              <div>
                <h3 className="text-lg font-semibold mb-2">À préparer</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {pendingOrders.length > 0 ? pendingOrders.map(o => <OrderCard key={o.id} order={o} />) : <p className="text-sm text-muted-foreground">Aucune commande à préparer.</p>}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">En cours</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {inPreparationOrders.length > 0 ? inPreparationOrders.map(o => <OrderCard key={o.id} order={o} />) : <p className="text-sm text-muted-foreground">Aucune commande en cours.</p>}
                </div>
              </div>
               <div>
                <h3 className="text-lg font-semibold mb-2">Prêtes</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {readyForDeliveryOrders.length > 0 ? readyForDeliveryOrders.map(o => <OrderCard key={o.id} order={o} />) : <p className="text-sm text-muted-foreground">Aucune commande prête.</p>}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Livrées</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                 {deliveredOrders.length > 0 ? deliveredOrders.map(o => <OrderCard key={o.id} order={o} />) : <p className="text-sm text-muted-foreground">Aucune commande livrée.</p>}
                </div>
              </div>
             </>
             )}
          </TabsContent>
          
          <TabsContent value="repas" className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold">Mes Repas ({meals.length})</h3>
            
             {loading ? (
                <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin text-primary" /></div>
             ) : (
            <div className="grid grid-cols-2 gap-4">
              {meals.map(meal => (
                <Card key={meal.id} className="space-y-2">
                  <Image src={meal.imageUrl} alt={meal.name} width={200} height={120} className="rounded-t-lg object-cover w-full h-24" data-ai-hint="caterer meal" />
                  <CardContent className="p-2">
                    <h4 className="font-semibold truncate">{meal.name}</h4>
                    <p className="text-sm font-bold">{meal.price.toFixed(2)} DT</p>
                    <p className="text-xs text-muted-foreground">{meal.calories} kcal</p>
                    <div className="flex justify-end items-center mt-1">
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible et supprimera le repas "{meal.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteMeal(meal)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
             <Button className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-lg h-12" onClick={() => router.push('/caterer/add-meal')}>
              <PlusCircle className="mr-2"/> Ajouter un repas
            </Button>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

    