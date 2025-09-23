
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell, Search, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Edit, UserCheck, UserX } from "lucide-react";
import { getAllCaterers, updateCatererStatus } from "@/lib/services/catererService";
import { getAllDeliveryPeople, updateDeliveryPersonStatus } from "@/lib/services/deliveryService";
import { getUserCount } from "@/lib/services/userService";
import { getAllOrders } from "@/lib/services/orderService";
import type { Caterer, DeliveryPerson, Order } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [caterers, setCaterers] = useState<Caterer[]>([]);
  const [deliveryPeople, setDeliveryPeople] = useState<DeliveryPerson[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [regionFilter, setRegionFilter] = useState("all");

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [caterersData, deliveryData, ordersData, count] = await Promise.all([
        getAllCaterers(),
        getAllDeliveryPeople(),
        getAllOrders(),
        getUserCount(),
      ]);

      const caterersWithTurnover = caterersData.map(caterer => ({
        ...caterer,
        turnover: calculateTurnover(ordersData, caterer.uid)
      }));

      setCaterers(caterersWithTurnover);
      setDeliveryPeople(deliveryData);
      setOrders(ordersData);
      setUserCount(count);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du tableau de bord.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const calculateTurnover = (allOrders: Order[], catererId: string): number => {
    return allOrders.reduce((total, order) => {
      const catererTurnoverInOrder = order.items
        .filter(item => item.catererId === catererId)
        .reduce((itemSum, item) => itemSum + (item.unitPrice * item.quantity), 0);
      return total + catererTurnoverInOrder;
    }, 0);
  };
  
  const handleCatererStatusChange = async (uid: string, status: 'approved' | 'rejected') => {
    try {
      await updateCatererStatus(uid, status);
      toast({ title: "Succès", description: `Le statut du traiteur a été mis à jour.` });
      fetchAdminData();
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut du traiteur.", variant: "destructive" });
    }
  };
  
  const handleDeliveryStatusChange = async (uid: string, status: 'approved' | 'rejected') => {
    try {
      await updateDeliveryPersonStatus(uid, status);
      toast({ title: "Succès", description: `Le statut du livreur a été mis à jour.` });
      fetchAdminData();
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut du livreur.", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">En attente</Badge>;
      case 'in_preparation': return <Badge className="bg-yellow-500 text-white">En préparation</Badge>;
      case 'delivered': return <Badge className="bg-green-500 text-white">Livrée</Badge>;
      case 'cancelled': return <Badge variant="destructive">Annulée</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };
  
  const getPartnerStatusBadge = (status: Caterer['status'] | DeliveryPerson['status']) => {
     switch (status) {
      case 'pending': return <Badge variant="secondary">En attente</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejeté</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  }

  const filteredOrders = orders.filter(order => 
    regionFilter === 'all' || order.clientRegion.toLowerCase() === regionFilter
  );
  
  const filteredCaterers = caterers.filter(c =>c.name &&  c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredDelivery = deliveryPeople.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-gradient-to-br from-primary via-primary to-background/30 p-4 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/kounfit/kounfit white.png" alt="Kounfit Logo" width={100} height={25} />
          </div>
          <Button variant="ghost" size="icon">
            <Bell />
          </Button>
        </div>
        <h2 className="text-4xl font-bold mt-4">Administration</h2>
      </header>
      
      <main className="flex-1 p-4 -mt-8 space-y-6">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-lg">
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{loading ? '...' : userCount}</p>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Traiteurs Actifs</p>
                    <p className="text-2xl font-bold">{loading ? '...' : caterers.filter(c => c.status === 'approved').length}</p>
                </CardContent>
            </Card>
             <Card className="shadow-lg">
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{loading ? '...' : orders.length}</p>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Turnover</p>
                    <p className="text-2xl font-bold">{loading ? '...' : orders.reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2) + ' DT'}</p>
                </CardContent>
            </Card>
        </div>

        <Tabs defaultValue="caterers">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="caterers">Gestion des Traiteurs</TabsTrigger>
                <TabsTrigger value="delivery">Gestion des Livreurs</TabsTrigger>
            </TabsList>
            <TabsContent value="caterers">
                 <Card>
                    <CardHeader>
                        <CardTitle>Liste des Traiteurs</CardTitle>
                        <div className="relative pt-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher par nom..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Traiteur</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {filteredCaterers.map(caterer => (
                                    <TableRow key={caterer.uid}>
                                        <TableCell>
                                            <p className="font-medium">{caterer.name}</p>
                                            <p className="text-xs text-muted-foreground">{caterer.email}</p>
                                        </TableCell>
                                        <TableCell>{getPartnerStatusBadge(caterer.status)}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            {caterer.status === 'pending' && <Button size="sm" className="bg-green-100 text-green-700 hover:bg-green-200" onClick={() => handleCatererStatusChange(caterer.uid, 'approved')}><UserCheck className="mr-1" /> Approuver</Button>}
                                            {caterer.status !== 'rejected' && <Button size="sm" variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200" onClick={() => handleCatererStatusChange(caterer.uid, 'rejected')}><UserX className="mr-1" /> Rejeter</Button>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                         </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="delivery">
                <Card>
                    <CardHeader>
                        <CardTitle>Liste des Livreurs</CardTitle>
                        <div className="relative pt-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher par nom..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </CardHeader>
                    <CardContent>
                         <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Livreur</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDelivery.map(person => (
                                    <TableRow key={person.uid}>
                                        <TableCell>
                                            <p className="font-medium">{person.name}</p>
                                            <p className="text-xs text-muted-foreground">{person.email}</p>
                                        </TableCell>
                                        <TableCell>{getPartnerStatusBadge(person.status)}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            {person.status === 'pending' && <Button size="sm" className="bg-green-100 text-green-700 hover:bg-green-200" onClick={() => handleDeliveryStatusChange(person.uid, 'approved')}><UserCheck className="mr-1" /> Approuver</Button>}
                                            {person.status !== 'rejected' && <Button size="sm" variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200" onClick={() => handleDeliveryStatusChange(person.uid, 'rejected')}><UserX className="mr-1" /> Rejeter</Button>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                         </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      
        <Card>
            <CardHeader>
              <CardTitle>Suivi des Commandes</CardTitle>
              <CardDescription>
                Visualisez et filtrez toutes les commandes des clients.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrer par région</label>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les régions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les régions</SelectItem>
                    <SelectItem value="grand tunis">Grand Tunis</SelectItem>
                    <SelectItem value="nabeul">Nabeul</SelectItem>
                    <SelectItem value="sousse">Sousse</SelectItem>
                    <SelectItem value="sfax">Sfax</SelectItem>
                    <SelectItem value="bizerte">Bizerte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Région</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24">
                            <Loader2 className="mx-auto animate-spin text-primary" />
                          </TableCell>
                        </TableRow>
                      ) : filteredOrders.length > 0 ? (
                        filteredOrders.map(order => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.clientName}</TableCell>
                            <TableCell>{order.clientRegion}</TableCell>
                            <TableCell>{format(order.orderDate, 'd MMM yyyy', { locale: fr })}</TableCell>
                            <TableCell>{order.totalPrice.toFixed(2)} DT</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                            Aucune commande trouvée pour cette région
                          </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
      </main>
    </div>
  );
}
