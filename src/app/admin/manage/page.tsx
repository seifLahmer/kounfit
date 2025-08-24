
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, ChevronLeft, ShieldAlert } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPendingCaterers, updateCatererStatus } from "@/lib/services/catererService";
import { getPendingDeliveryPeople, updateDeliveryPersonStatus } from "@/lib/services/deliveryService";
import type { Caterer, DeliveryPerson } from "@/lib/types";

export default function AdminManagePage() {
  const { toast } = useToast();
  const router = useRouter();

  const [pendingCaterers, setPendingCaterers] = useState<Caterer[]>([]);
  const [pendingDelivery, setPendingDelivery] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingAccounts = async () => {
    setLoading(true);
    try {
      const [caterers, delivery] = await Promise.all([
        getPendingCaterers(),
        getPendingDeliveryPeople()
      ]);
      setPendingCaterers(caterers);
      setPendingDelivery(delivery);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les comptes en attente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAccounts();
  }, []);

  const handleCatererApproval = async (uid: string, newStatus: 'approved' | 'rejected') => {
    try {
      await updateCatererStatus(uid, newStatus);
      toast({
        title: "Succès",
        description: `Le statut du traiteur a été mis à jour.`,
      });
      fetchPendingAccounts(); // Refresh the list
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du traiteur.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeliveryApproval = async (uid: string, newStatus: 'approved' | 'rejected') => {
    try {
      await updateDeliveryPersonStatus(uid, newStatus);
      toast({
        title: "Succès",
        description: `Le statut du livreur a été mis à jour.`,
      });
      fetchPendingAccounts(); // Refresh the list
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du livreur.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft />
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">
          Approbation des Comptes
        </h1>
      </header>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Traiteurs en Attente</CardTitle>
              <CardDescription>Approuvez ou refusez les nouvelles inscriptions de traiteurs.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingCaterers.length > 0 ? pendingCaterers.map((caterer) => (
                    <TableRow key={caterer.uid}>
                      <TableCell>{caterer.name}</TableCell>
                      <TableCell>{caterer.email}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700" onClick={() => handleCatererApproval(caterer.uid, 'approved')}>
                          <CheckCircle />
                        </Button>
                         <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleCatererApproval(caterer.uid, 'rejected')}>
                          <XCircle />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground h-24">Aucun traiteur en attente.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader>
              <CardTitle>Livreurs en Attente</CardTitle>
              <CardDescription>Approuvez ou refusez les nouvelles inscriptions de livreurs.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDelivery.length > 0 ? pendingDelivery.map((person) => (
                    <TableRow key={person.uid}>
                      <TableCell>{person.name}</TableCell>
                      <TableCell>{person.email}</TableCell>
                       <TableCell className="text-right space-x-2">
                        <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700" onClick={() => handleDeliveryApproval(person.uid, 'approved')}>
                          <CheckCircle />
                        </Button>
                         <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDeliveryApproval(person.uid, 'rejected')}>
                          <XCircle />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground h-24">Aucun livreur en attente.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
