
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChefHat, Save, Users, Mail, MapPin } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from 'firebase/firestore';
import { updateCaterer } from "@/lib/services/catererService";
import { getAllDeliveryPeople } from "@/lib/services/deliveryService";
import type { Caterer, DeliveryPerson } from "@/lib/types";

const profileSchema = z.object({
  name: z.string().min(2, "Le nom est requis."),
  preferredDeliveryPeople: z.array(z.string()).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function CatererProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [caterer, setCaterer] = useState<Caterer | null>(null);
  const [availableDeliveryPeople, setAvailableDeliveryPeople] = useState<DeliveryPerson[]>([]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      preferredDeliveryPeople: [],
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
      const catererDocRef = doc(db, 'caterers', user.uid);
      const catererSnap = await getDoc(catererDocRef);
      if (catererSnap.exists()) {
        const catererData = catererSnap.data() as Caterer;
        setCaterer(catererData);
        form.reset({
          name: catererData.name,
          preferredDeliveryPeople: catererData.preferredDeliveryPeople || [],
        });

        const allDeliveryPeople = await getAllDeliveryPeople();
        const approvedInRegion = allDeliveryPeople.filter(
          p => p.region === catererData.region && p.status === 'approved'
        );
        setAvailableDeliveryPeople(approvedInRegion);
      } else {
        toast({ title: "Erreur", description: "Profil traiteur introuvable.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger le profil.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [router, toast, form]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!caterer) return;
    setIsSaving(true);
    try {
      await updateCaterer(caterer.uid, {
        name: data.name,
        preferredDeliveryPeople: data.preferredDeliveryPeople || [],
      });
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
      // Refetch data to ensure UI is consistent
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
        <ChefHat className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-gray-800">Mon Profil Traiteur</h1>
      </header>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Informations Générales</CardTitle>
            <CardDescription>Consultez vos informations et modifiez votre nom.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du Restaurant</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Email (non modifiable)</Label>
              <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground gap-2">
                <Mail className="w-4 h-4" />
                {caterer?.email}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Région (non modifiable)</Label>
              <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground gap-2">
                <MapPin className="w-4 h-4" />
                <span className="capitalize">{caterer?.region}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mes Livreurs Préférés</CardTitle>
            <CardDescription>
              Sélectionnez les livreurs que vous souhaitez voir lors de l'assignation d'une commande.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableDeliveryPeople.length > 0 ? (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="preferredDeliveryPeople"
                  render={({ field }) => (
                    <>
                      {availableDeliveryPeople.map((person) => (
                        <div key={person.uid} className="flex items-center space-x-3 rounded-md border p-3">
                           <Checkbox
                            id={`person-${person.uid}`}
                            checked={field.value?.includes(person.uid)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), person.uid])
                                : field.onChange(field.value?.filter((id) => id !== person.uid));
                            }}
                          />
                          <Label htmlFor={`person-${person.uid}`} className="flex-1 cursor-pointer">
                            <p className="font-semibold">{person.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{person.vehicleType}</p>
                          </Label>
                        </div>
                      ))}
                    </>
                  )}
                />
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Aucun livreur approuvé n'a été trouvé dans votre région pour le moment.
              </p>
            )}
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
