
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChefHat, Save, Users, Mail, MapPin, CheckCircle } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from 'firebase/firestore';
import { updateCaterer } from "@/lib/services/catererService";
import { getAllDeliveryPeople } from "@/lib/services/deliveryService";
import type { Caterer, DeliveryPerson } from "@/lib/types";
import { FormField } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  name: z.string().min(2, "Le nom est requis."),
  preferredDeliveryPeople: z.array(z.string()).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function CatererProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [caterer, setCaterer] = useState<Caterer | null>(null);
  const [availableDeliveryPeople, setAvailableDeliveryPeople] = useState<DeliveryPerson[]>([]);
  const isMounted = useRef(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      preferredDeliveryPeople: [],
    },
    mode: "onBlur",
  });

  const fetchProfileData = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (isMounted.current) setLoading(true);

    try {
      const catererDocRef = doc(db, 'caterers', user.uid);
      const catererSnap = await getDoc(catererDocRef);
      if (catererSnap.exists() && isMounted.current) {
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
      if (isMounted.current) setLoading(false);
    }
  }, [router, toast, form]);

  useEffect(() => {
    isMounted.current = true;
    const unsubscribe = auth.onAuthStateChanged((user) => {
        if(user) {
            fetchProfileData();
        } else {
            router.push('/login');
        }
    });
    return () => {
      isMounted.current = false;
      unsubscribe();
    }
  }, [fetchProfileData, router]);

  const handleAutoSave = async (data: Partial<ProfileFormValues>) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    const result = profileSchema.safeParse(form.getValues());
    if (!result.success) return;

    setSaveStatus("saving");
    try {
      await updateCaterer(currentUser.uid, result.data);
      setTimeout(() => setSaveStatus("saved"), 500);
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      setSaveStatus("idle");
      toast({ title: "Erreur de sauvegarde", description: "Vos modifications n'ont pas pu être enregistrées.", variant: "destructive" });
    }
  };

  const onBlur = (fieldName: keyof ProfileFormValues) => {
    form.trigger(fieldName).then(isValid => {
      if (isValid) {
        handleAutoSave(form.getValues());
      }
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-primary">
       <div className="p-4 pt-8">
            <div className="flex justify-between items-center text-white mb-6">
                <h1 className="text-xl font-bold">MON PROFIL</h1>
            </div>
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-white/50">
                    <AvatarFallback><ChefHat size={32}/></AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-2xl font-bold text-white">{caterer?.name}</h2>
                    <p className="text-white/80 text-sm">
                        {caterer?.email}
                    </p>
                </div>
            </div>
        </div>
      
       <Card className="rounded-t-3xl mt-6">
         <CardContent className="p-4 space-y-6">
            <div className="h-6 flex items-center justify-center">
              {saveStatus === "saving" && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</div>}
              {saveStatus === "saved" && <div className="flex items-center text-sm text-green-600"><CheckCircle className="mr-2 h-4 w-4" />Modifications enregistrées!</div>}
            </div>

            <form className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du Restaurant</Label>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <Input id="name" {...field} onBlur={() => onBlur('name')} />
                  )}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Région (non modifiable)</Label>
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="capitalize">{caterer?.region}</span>
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold">Mes Livreurs Préférés</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Sélectionnez les livreurs qui apparaissent lors de l'assignation d'une commande.
                </p>
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
                                  const newValue = checked
                                    ? [...(field.value || []), person.uid]
                                    : (field.value || []).filter((id) => id !== person.uid);
                                  field.onChange(newValue);
                                  handleAutoSave({ preferredDeliveryPeople: newValue });
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
              </div>
            </form>
         </CardContent>
       </Card>
    </div>
  );
}
