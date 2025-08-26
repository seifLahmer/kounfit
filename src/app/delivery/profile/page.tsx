
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Save, Mail, MapPin, Bike } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from 'firebase/firestore';
import { updateDeliveryPerson } from "@/lib/services/deliveryService";
import type { DeliveryPerson } from "@/lib/types";

const profileSchema = z.object({
  name: z.string().min(2, "Le nom est requis."),
  vehicleType: z.enum(["scooter", "car", "bicycle"]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function DeliveryProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      vehicleType: "scooter",
    },
  });

  const fetchProfileData = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const deliveryDocRef = doc(db, 'deliveryPeople', user.uid);
      const deliverySnap = await getDoc(deliveryDocRef);
      if (deliverySnap.exists()) {
        const personData = deliverySnap.data() as DeliveryPerson;
        setDeliveryPerson(personData);
        form.reset({
          name: personData.name,
          vehicleType: personData.vehicleType,
        });
      } else {
        toast({ title: "Erreur", description: "Profil livreur introuvable.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger le profil.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [router, toast, form]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        if(user) {
            fetchProfileData();
        } else {
            router.push('/login');
        }
    });
    return () => unsubscribe();
  }, [fetchProfileData, router]);

  const onSubmit = async (data: ProfileFormValues) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        toast({ title: "Erreur", description: "Vous n'êtes pas connecté.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    try {
      await updateDeliveryPerson(currentUser.uid, {
        name: data.name,
        vehicleType: data.vehicleType,
      });
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
      await fetchProfileData();
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le profil.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center gap-4">
        <User className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-gray-800">Mon Profil Livreur</h1>
      </header>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
            <CardDescription>Consultez et modifiez vos informations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom Complet</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="vehicleType">Type de véhicule</Label>
                <Select onValueChange={(value) => form.setValue('vehicleType', value as any)} defaultValue={form.getValues('vehicleType')}>
                    <SelectTrigger id="vehicleType">
                        <SelectValue placeholder="Sélectionnez un véhicule" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="scooter">Scooter</SelectItem>
                        <SelectItem value="car">Voiture</SelectItem>
                        <SelectItem value="bicycle">Vélo</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
              <Label>Email (non modifiable)</Label>
              <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground gap-2">
                <Mail className="w-4 h-4" />
                {deliveryPerson?.email}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Région (non modifiable)</Label>
              <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground gap-2">
                <MapPin className="w-4 h-4" />
                <span className="capitalize">{deliveryPerson?.region}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-12" disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Enregistrer les modifications
        </Button>
      </form>
    </div>
  );
}
