
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  User,
  Save,
  Mail,
  MapPin,
  Bike,
  CheckCircle,
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { updateDeliveryPerson } from "@/lib/services/deliveryService";
import type { DeliveryPerson } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FormItem } from "@/components/ui/form";

const profileSchema = z.object({
  name: z.string().min(2, "Le nom est requis."),
  vehicleType: z.enum(["scooter", "car", "bicycle"]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function DeliveryProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [deliveryPerson, setDeliveryPerson] =
    useState<DeliveryPerson | null>(null);
  const isMounted = useRef(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      vehicleType: "scooter",
    },
    mode: "onBlur",
  });

  const fetchProfileData = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }
    if (isMounted.current) setLoading(true);
    try {
      const deliveryDocRef = doc(db, "deliveryPeople", user.uid);
      const deliverySnap = await getDoc(deliveryDocRef);
      if (deliverySnap.exists() && isMounted.current) {
        const personData = deliverySnap.data() as DeliveryPerson;
        setDeliveryPerson(personData);
        form.reset({
          name: personData.name,
          vehicleType: personData.vehicleType,
        });
      } else {
        toast({
          title: "Erreur",
          description: "Profil livreur introuvable.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil.",
        variant: "destructive",
      });
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [router, toast, form]);

  useEffect(() => {
    isMounted.current = true;
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchProfileData();
      } else {
        router.push("/login");
      }
    });
    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, [fetchProfileData, router]);

  const handleAutoSave = async (data: Partial<ProfileFormValues>) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const result = profileSchema.safeParse(form.getValues());
    if (!result.success) return;

    setSaveStatus("saving");
    try {
      await updateDeliveryPerson(currentUser.uid, result.data);
      setTimeout(() => setSaveStatus("saved"), 500);
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      setSaveStatus("idle");
      toast({
        title: "Erreur de sauvegarde",
        description: "Vos modifications n'ont pas pu être enregistrées.",
        variant: "destructive",
      });
    }
  };

  const onBlur = (fieldName: keyof ProfileFormValues) => {
    form.trigger(fieldName).then((isValid) => {
      if (isValid) {
        handleAutoSave(form.getValues());
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const userValues = form.getValues();

  return (
    <div className="bg-primary">
      <div className="p-4 pt-8">
        <div className="flex justify-between items-center text-white mb-6">
          <h1 className="text-xl font-bold">MON PROFIL</h1>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-white/50">
            <AvatarFallback>
              <User size={32} />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-white">{userValues.name}</h2>
            <p className="text-white/80 text-sm">{deliveryPerson?.email}</p>
          </div>
        </div>
      </div>

      <Card className="rounded-t-3xl mt-6">
        <CardContent className="p-4 space-y-6">
          <div className="h-6 flex items-center justify-center">
            {saveStatus === "saving" && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </div>
            )}
            {saveStatus === "saved" && (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="mr-2 h-4 w-4" />
                Modifications enregistrées!
              </div>
            )}
          </div>

          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom Complet</Label>
              <Controller
                name="name"
                control={form.control}
                render={({ field }) => (
                  <Input id="name" {...field} onBlur={() => onBlur("name")} />
                )}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <Controller
              name="vehicleType"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Label>Type de véhicule</Label>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleAutoSave({
                        ...form.getValues(),
                        vehicleType: value as any,
                      });
                    }}
                    value={field.value}
                  >
                    <SelectTrigger id="vehicleType">
                      <SelectValue placeholder="Sélectionnez un véhicule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scooter">Scooter</SelectItem>
                      <SelectItem value="car">Voiture</SelectItem>
                      <SelectItem value="bicycle">Vélo</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
