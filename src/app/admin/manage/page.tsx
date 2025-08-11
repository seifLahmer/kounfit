
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldAlert, UserPlus, ChevronLeft } from "lucide-react";
import { addCaterer } from "@/lib/services/catererService";
import { addAdmin } from "@/lib/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function AdminManagePage() {
  const { toast } = useToast();
  const router = useRouter();
  
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
  
  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center gap-4">
         <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ChevronLeft />
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">
          Gestion des Rôles
        </h1>
      </header>

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
      </div>
    </div>
  );
}
