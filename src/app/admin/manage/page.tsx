
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldAlert, Trash2, TrendingUp, UserPlus, ChevronLeft } from "lucide-react";
import { addCaterer, getAllCaterers, deleteCaterer } from "@/lib/services/catererService";
import { addAdmin } from "@/lib/services/adminService";
import { getAllOrders } from "@/lib/services/orderService";
import type { Caterer, Order } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function AdminManagePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [caterers, setCaterers] = useState<Caterer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingCaterers, setLoadingCaterers] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // State for adding caterer
  const [isAddingCaterer, setIsAddingCaterer] = useState(false);
  const [catererUid, setCatererUid] = useState("");
  const [catererName, setCatererName] = useState("");
  const [catererEmail, setCatererEmail] = useState("");
  const [catererRegion, setCatererRegion] = useState("");

  // State for adding admin
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [adminUid, setAdminUid] = useState("");
  const [adminEmail, setAdminEmail] = useState("");


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
      setLoadingCaterers(true);
      setLoadingOrders(true);
      const [caterersData, ordersData] = await Promise.all([
        getAllCaterers(),
        getAllOrders(),
      ]);

      const caterersWithTurnover = caterersData.map(caterer => ({
        ...caterer,
        turnover: calculateTurnover(ordersData, caterer.uid)
      }));

      setCaterers(caterersWithTurnover);
      setOrders(ordersData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données.",
        variant: "destructive",
      });
    } finally {
      setLoadingCaterers(false);
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddCaterer = async () => {
    if (!catererUid || !catererName || !catererEmail || !catererRegion) {
      toast({ title: "Champs requis", description: "Veuillez remplir tous les champs pour le traiteur.", variant: "destructive" });
      return;
    }
    setIsAddingCaterer(true);
    try {
      await addCaterer({ uid: catererUid, name: catererName, email: catererEmail, region: catererRegion });
      toast({ title: "Succès", description: "Le traiteur a été ajouté." });
      setCatererUid("");
      setCatererName("");
      setCatererEmail("");
      setCatererRegion("");
      fetchAdminData(); // Refresh list
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible d'ajouter le traiteur.", variant: "destructive" });
    } finally {
      setIsAddingCaterer(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!adminUid || !adminEmail) {
      toast({ title: "Champs requis", description: "Veuillez fournir l'UID et l'email pour l'administrateur.", variant: "destructive" });
      return;
    }
    setIsAddingAdmin(true);
    try {
        await addAdmin({ uid: adminUid, email: adminEmail });
        toast({ title: "Succès", description: "Le nouvel administrateur a été ajouté." });
        setAdminUid("");
        setAdminEmail("");
    } catch (error) {
        toast({ title: "Erreur", description: "Impossible d'ajouter l'administrateur.", variant: "destructive" });
    } finally {
        setIsAddingAdmin(false);
    }
  };
  
  const handleDeleteCaterer = async (uid: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce traiteur? Cette action est irréversible.")) return;

    try {
      await deleteCaterer(uid);
      toast({ title: "Succès", description: "Le traiteur a été supprimé." });
      fetchAdminData(); // Refresh list
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer le traiteur.", variant: "destructive" });
    } finally {
      setIsAddingCaterer(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    regionFilter === 'all' || order.clientRegion.toLowerCase() === regionFilter
  );

  const totalOrdersValue = orders.reduce((sum, order) => sum + order.totalPrice, 0);


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
    <div className="p-4 space-y-6">
      <header className="flex items-center gap-4">
         <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ChevronLeft />
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">
          Gestion Avancée
        </h1>
      </header>

      <Tabs defaultValue="traiteurs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="traiteurs">Gestion des Rôles</TabsTrigger>
          <TabsTrigger value="commandes">Suivi des Commandes</TabsTrigger>
        </TabsList>
        <TabsContent value="traiteurs">
           <div className="space-y-6">
            <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Action Manuelle Requise</AlertTitle>
                <AlertDescription>
                Pour des raisons de sécurité, vous devez d'abord créer le compte de
                l'utilisateur dans la console Firebase Authentication (avec un email/mot de
                passe), puis copier son UID et le coller dans le champ approprié ci-dessous pour lui assigner un rôle.
                </AlertDescription>
            </Alert>
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                <CardHeader>
                    <CardTitle>Ajouter un nouveau traiteur</CardTitle>
                    <CardDescription>
                    Créez un profil pour un utilisateur traiteur.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="caterer-uid">UID du Traiteur (Firebase Auth)</Label>
                    <Input id="caterer-uid" placeholder="Copiez l'UID depuis la console Firebase" value={catererUid} onChange={e => setCatererUid(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="caterer-name">Nom Complet</Label>
                    <Input id="caterer-name" placeholder="Ex: Jean Traiteur" value={catererName} onChange={e => setCatererName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="caterer-email">Email du Traiteur</Label>
                    <Input id="caterer-email" placeholder="Ex: traiteur@exemple.com" value={catererEmail} onChange={e => setCatererEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="caterer-region">Région</Label>
                    <Input id="caterer-region" placeholder="Ex: Tunis" value={catererRegion} onChange={e => setCatererRegion(e.target.value)} />
                    </div>
                    <Button onClick={handleAddCaterer} disabled={isAddingCaterer} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white">
                    {isAddingCaterer && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <UserPlus className="mr-2"/> Ajouter le Traiteur
                    </Button>
                </CardContent>
                </Card>

                 <Card>
                <CardHeader>
                    <CardTitle>Ajouter un nouvel administrateur</CardTitle>
                    <CardDescription>
                    Donner les privilèges d'administrateur à un utilisateur.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="admin-uid">UID de l'administrateur (Firebase Auth)</Label>
                    <Input id="admin-uid" placeholder="Copiez l'UID depuis la console Firebase" value={adminUid} onChange={e => setAdminUid(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="admin-email">Email de l'administrateur</Label>
                    <Input id="admin-email" placeholder="Ex: admin@exemple.com" type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
                    </div>
                    <Button onClick={handleAddAdmin} disabled={isAddingAdmin} className="w-full md:w-auto bg-destructive hover:bg-destructive/90 text-white">
                        {isAddingAdmin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <ShieldAlert className="mr-2" /> Ajouter l'Administrateur
                    </Button>
                </CardContent>
                </Card>
            </div>


             <Card>
              <CardHeader>
                <CardTitle>Liste des Traiteurs</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="border rounded-md">
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>UID</TableHead>
                        <TableHead>Région</TableHead>
                        <TableHead>Chiffre d'affaires</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingCaterers ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                            <Loader2 className="mx-auto animate-spin text-primary" />
                          </TableCell>
                        </TableRow>
                      ) : caterers.length > 0 ? (
                        caterers.map(caterer => (
                          <TableRow key={caterer.uid}>
                            <TableCell className="font-medium">{caterer.name}</TableCell>
                            <TableCell>{caterer.email}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">{caterer.uid}</TableCell>
                            <TableCell>{caterer.region}</TableCell>
                            <TableCell className="font-semibold">{caterer.turnover?.toFixed(2) ?? '0.00'} DT</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteCaterer(caterer.uid)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                            Aucun traiteur n'a encore été ajouté.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="commandes">
          <Card>
            <CardHeader>
              <CardTitle>Suivi des Commandes</CardTitle>
              <CardDescription>
                Visualisez, filtrez et suivez toutes les commandes des clients.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                      <div className="bg-red-100 p-3 rounded-full">
                          <TrendingUp className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                          <p className="text-sm text-muted-foreground">Chiffre d'affaires total</p>
                          <p className="text-2xl font-bold">{totalOrdersValue.toFixed(2)} DT</p>
                      </div>
                  </CardContent>
              </Card>
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
                     {loadingOrders ? (
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
