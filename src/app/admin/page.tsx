
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
import { Bell, Search, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Edit, TrendingUp } from "lucide-react";
import { getAllCaterers, deleteCaterer } from "@/lib/services/catererService";
import { getUserCount } from "@/lib/services/userService";
import { getAllOrders } from "@/lib/services/orderService";
import type { Caterer, Order } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [caterers, setCaterers] = useState<Caterer[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [regionFilter, setRegionFilter] = useState("all");


  const calculateTurnover = (allOrders: Order[], catererId: string): number => {
    return allOrders.reduce((total, order) => {
      const catererTurnoverInOrder = order.items
        .filter(item => item.catererId === catererId)
        .reduce((itemSum, item) => itemSum + (item.unitPrice * item.quantity), 0);
      return total + catererTurnoverInOrder;
    }, 0);
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [caterersData, ordersData, count] = await Promise.all([
        getAllCaterers(),
        getAllOrders(),
        getUserCount(),
      ]);

      const caterersWithTurnover = caterersData.map(caterer => ({
        ...caterer,
        turnover: calculateTurnover(ordersData, caterer.uid)
      }));

      setCaterers(caterersWithTurnover);
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
  
  const handleDeleteCaterer = async (uid: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce traiteur? Cette action est irréversible.")) return;
    try {
      await deleteCaterer(uid);
      toast({ title: "Succès", description: "Le traiteur a été supprimé." });
      fetchAdminData(); // Refresh list
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer le traiteur.", variant: "destructive" });
    }
  };

  const filteredCaterers = caterers.filter(caterer =>
    caterer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caterer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCaterers = filteredCaterers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCaterers.length / itemsPerPage);

  const totalOrdersValue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  const filteredOrders = orders.filter(order => 
    regionFilter === 'all' || order.clientRegion.toLowerCase() === regionFilter
  );

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">En attente</Badge>;
      case 'in_preparation': return <Badge className="bg-yellow-500 text-white">En préparation</Badge>;
      case 'delivered': return <Badge className="bg-green-500 text-white">Livrée</Badge>;
      case 'cancelled': return <Badge variant="destructive">Annulée</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-gradient-to-br from-primary via-primary to-background/30 p-4 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white text-primary font-bold rounded-md p-2 h-8 w-8 flex items-center justify-center">K</div>
            <h1 className="text-xl font-bold">Kounfit</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Bell />
          </Button>
        </div>
        <h2 className="text-4xl font-bold mt-4">Administration</h2>
      </header>
      
      <main className="flex-1 p-4 -mt-16 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-lg">
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{loading ? '...' : userCount}</p>
                    <div className="flex items-center text-sm text-green-500 gap-1"><ArrowUp className="w-4 h-4" /> 2,7%</div>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Active Traiteurs</p>
                    <p className="text-2xl font-bold">{loading ? '...' : caterers.length}</p>
                    <div className="flex items-center text-sm text-red-500 gap-1"><ArrowDown className="w-4 h-4" /> 1,2%</div>
                </CardContent>
            </Card>
             <Card className="shadow-lg">
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{loading ? '...' : orders.length}</p>
                    <div className="flex items-center text-sm text-green-500 gap-1"><ArrowUp className="w-4 h-4" /> 8,4%</div>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Turnover</p>
                    <p className="text-2xl font-bold">{loading ? '...' : totalOrdersValue.toFixed(2) + ' DT'}</p>
                    <div className="flex items-center text-sm text-green-500 gap-1"><ArrowUp className="w-4 h-4" /> 5,1%</div>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Liste des Traiteurs</CardTitle>
                <div className="flex gap-2 pt-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search" 
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline">Filtre</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Traiteur</TableHead>
                                <TableHead>Région</TableHead>
                                <TableHead className="text-right">Chiffre d'affaires</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedCaterers.map(caterer => (
                                <TableRow key={caterer.uid}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={`https://placehold.co/40x40.png`} alt={caterer.name} />
                                                <AvatarFallback>{caterer.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{caterer.name}</p>
                                                <p className="text-xs text-muted-foreground">{caterer.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{caterer.region}</TableCell>
                                    <TableCell className="text-right font-semibold">{caterer.turnover?.toFixed(2) ?? '0.00'} €</TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                          variant="destructive" 
                                          size="sm" 
                                          className="bg-red-100 text-red-600 hover:bg-red-200"
                                          onClick={() => handleDeleteCaterer(caterer.uid)}
                                        >
                                          Supprimer
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex justify-center items-center gap-2 mt-4">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium">{currentPage}</span>
                     <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>

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
                    <SelectItem value="tunis">Tunis</SelectItem>
                    <SelectItem value="ariana">Ariana</SelectItem>
                    <SelectItem value="ben arous">Ben Arous</SelectItem>
                    <SelectItem value="manouba">La Manouba</SelectItem>
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

        <Link href="/admin/manage">
          <Card className="hover:bg-muted transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className="bg-gray-100 p-3 rounded-lg">
                          <Edit className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                          <p className="font-bold">Gestion des Rôles</p>
                          <p className="text-sm text-muted-foreground">Ajouter ou gérer les traiteurs et administrateurs</p>
                      </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground"/>
              </CardContent>
          </Card>
        </Link>
      </main>
    </div>
  );
}
