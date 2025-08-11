
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell, Search, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { getAllCaterers, deleteCaterer } from "@/lib/services/catererService";
import { getUserCount } from "@/lib/services/userService";
import { getAllOrders } from "@/lib/services/orderService";
import type { Caterer, Order } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  const dailyOrders = orders.filter(order => {
      const orderDate = order.orderDate.toDate ? order.orderDate.toDate() : new Date(order.orderDate);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
  }).length;


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
        <div className="grid grid-cols-3 gap-4">
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
                    <p className="text-sm text-muted-foreground">Daily Orders</p>
                    <p className="text-2xl font-bold">{loading ? '...' : dailyOrders}</p>
                    <div className="flex items-center text-sm text-green-500 gap-1"><ArrowUp className="w-4 h-4" /> 8,4%</div>
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

        <Link href="/admin/manage">
          <Card className="hover:bg-muted transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className="bg-gray-100 p-3 rounded-lg">
                          <Edit className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                          <p className="font-bold">Gestion Avancée</p>
                          <p className="text-sm text-muted-foreground">Ajouter/Gérer les rôles et suivre les commandes</p>
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
