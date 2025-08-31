
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
import { Bell, ChefHat, PlusCircle, Loader2, Trash2, CheckCircle, Edit2, MoreHorizontal, Utensils, ClipboardList, Bike, MapPin } from "lucide-react";
import { getMealsByCaterer, deleteMeal, getMealById } from "@/lib/services/mealService";
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
import { Separator } from '@/components/ui/separator';
import { cn } from "@/lib/utils";


export default function CatererPage() {
  const [caterer, setCaterer] = useState<Caterer | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [preferredDeliveryPeople, setPreferredDeliveryPeople] = useState<DeliveryPerson[]>([]);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderMeals, setSelectedOrderMeals] = useState<Meal[]>([]);
  const [isMealDetailsLoading, setIsMealDetailsLoading] = useState(false);
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

            const preferredIds = catererData.preferredDeliveryPeople || [];
            const deliveryInRegion = allDeliveryPeople.filter(
                person => preferredIds.includes(person.uid) && person.status === 'approved'
            );
            setPreferredDeliveryPeople(deliveryInRegion);

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
  
 const handleViewDetails = async (order: Order) => {
    setIsMealDetailsLoading(true);
    setSelectedOrderMeals([]);
    setSelectedOrder(order); // Set the selected order
    try {
      const mealPromises = order.items.map(item => getMealById(item.mealId));
      const mealsDetails = await Promise.all(mealPromises);
      const validMeals = mealsDetails.filter((m): m is Meal => m !== null);
      
      const mealsWithQuantities = validMeals.map(meal => {
        const orderItem = order.items.find(item => item.mealId === meal.id);
        return {
          ...meal,
          quantity: orderItem?.quantity || 0,
        };
      });
      
      setSelectedOrderMeals(mealsWithQuantities);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les détails de la commande.", variant: "destructive" });
    } finally {
      setIsMealDetailsLoading(false);
    }
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
    const isClickable = order.status === 'pending' || order.status === 'in_preparation';
    
    const ActionButton = () => {
        switch(order.status) {
            case 'pending':
                return (
                    <Button onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, 'in_preparation'); }} className='w-full bg-primary hover:bg-primary/90 text-white rounded-lg'>
                        Préparer
                    </Button>
                );
            case 'in_preparation':
                return (
                    <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedDeliveryPerson(null)}>
                        <DialogTrigger asChild>
                            <Button onClick={(e) => e.stopPropagation()} className='w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg'>
                                Prêt (Choisir livreur)
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Assigner un livreur</DialogTitle>
                                <DialogDescription>Choisissez un livreur pour la commande #{order.id.substring(0, 5)}.</DialogDescription>
                            </DialogHeader>
                            {preferredDeliveryPeople.length > 0 ? (
                                <Select onValueChange={setSelectedDeliveryPerson}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner un livreur..." /></SelectTrigger>
                                    <SelectContent>
                                        {preferredDeliveryPeople.map(person => (
                                            <SelectItem key={person.uid} value={person.uid}>{person.name} ({person.vehicleType})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="text-sm text-muted-foreground text-center py-4">
                                    <p>Aucun livreur préféré trouvé.</p>
                                    <Button variant="link" onClick={() => router.push('/caterer/profile')}>Gérer ma liste de livreurs</Button>
                                </div>
                            )}
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button onClick={() => handleAssignDelivery(order.id)} disabled={!selectedDeliveryPerson || preferredDeliveryPeople.length === 0}>
                                        <Bike className="mr-2 h-4 w-4" /> Assigner
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                );
            case 'ready_for_delivery':
                return <Button disabled className='w-full bg-yellow-500 text-white rounded-lg'>En attente du livreur</Button>;
            default:
                return null;
        }
    };

    return (
        <Card 
            onClick={() => isClickable && handleViewDetails(order)} 
            className={cn(
                "w-64 shrink-0 shadow-lg transition-transform duration-300",
                isClickable && "hover:scale-105 cursor-pointer"
            )}
        >
            <CardContent className="p-4 space-y-3 flex flex-col h-full">
                <div className="flex items-center gap-3">
                    <Avatar><AvatarImage src={`https://placehold.co/40x40.png`} /><AvatarFallback>{order.clientName.charAt(0)}</AvatarFallback></Avatar>
                    <span className="font-semibold">{order.clientName}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4 mt-0.5 shrink-0"/><span>{order.deliveryAddress}</span></div>
                <div className="text-sm text-muted-foreground min-h-[40px] border-t pt-2">
                    {order.items.slice(0, 2).map((item, index) => (<p key={`${item.mealId}-${index}`}>{item.quantity}x {item.mealName}</p>))}
                </div>
                
                {order.status === 'pending' && <Badge variant="secondary">À préparer</Badge>}
                {order.status === 'in_preparation' && <Badge className="bg-blue-100 text-blue-800">En cours</Badge>}
                {order.status === 'ready_for_delivery' && <Badge className="bg-yellow-100 text-yellow-800">Prêt</Badge>}
                {order.status === 'delivered' && <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Livrée</Badge>}
                
                <p className="font-bold text-lg mt-auto">{order.totalPrice.toFixed(2)} DT</p>
                
                <ActionButton />
            </CardContent>
        </Card>
    )
  };

  return (
    <Dialog open={!!selectedOrder} onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}>
        <div className="bg-primary">
        <header className="p-2 flex justify-between items-center text-white border-b border-white/20">
            <Image src="/kounfit/kounfit white.png" alt="Kounfit Logo" width={120} height={30} />
            <Button variant="ghost" size="icon">
            <Bell />
            </Button>
        </header>
        <main className="bg-white p-4 space-y-6 rounded-t-3xl">
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
        {selectedOrder && (
            <DialogContent className="max-h-[80svh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Détails de la Commande #{selectedOrder.id.substring(0,5)}</DialogTitle>
                    <DialogDescription>Liste des repas et ingrédients pour la préparation.</DialogDescription>
                </DialogHeader>
                {isMealDetailsLoading ? (
                    <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : (
                    <div className="space-y-4">
                        {selectedOrderMeals.map(meal => (
                            <div key={meal.id} className="space-y-2">
                                <h3 className="font-semibold text-lg text-primary">{(meal as any).quantity}x {meal.name}</h3>
                                <div className="pl-4 border-l-2 border-primary/50 space-y-1 text-sm">
                                    {meal.ingredients.map((ing, index) => (
                                        <div key={`${ing.name}-${index}`} className="flex justify-between">
                                            <span>{ing.name}</span>
                                            <span className="text-muted-foreground">{ing.grams}g</span>
                                        </div>
                                    ))}
                                </div>
                                <Separator className="my-2"/>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        )}
    </Dialog>
  );
}

    