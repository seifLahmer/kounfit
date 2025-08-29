"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Camera, Loader2, CheckCircle, LogOut, MapPin } from "lucide-react"
import Image from "next/image"
import * as React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MainLayout } from "@/components/main-layout"
import { useToast } from "@/hooks/use-toast"
import { updateUserProfile, getUserProfile } from "@/lib/services/userService"
import { auth } from "@/lib/firebase"
import { uploadProfileImage } from "@/lib/services/storageService"
import { calculateNutritionalNeeds } from "@/lib/services/nutritionService"
import type { User } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GoogleIcon } from "@/components/icons"
import LocationPicker from "@/components/location-picker"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"


const profileFormSchema = z.object({
  fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  age: z.coerce.number().min(16, "Vous devez avoir au moins 16 ans.").max(120),
  biologicalSex: z.enum(["male", "female"], {
    required_error: "Veuillez sélectionner votre sexe.",
  }),
  weight: z.coerce.number().min(30, "Le poids doit être un nombre positif."),
  height: z.coerce.number().min(100, "La taille doit être un nombre positif."),
  deliveryAddress: z.string().optional(),
  region: z.string().optional(),
  activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"], {
    required_error: "Veuillez sélectionner un niveau d'activité.",
  }),
  mainGoal: z.enum(["lose_weight", "maintain", "gain_muscle"], {
    required_error: "Veuillez sélectionner un objectif principal.",
  }),
  photoURL: z.string().url().optional().nullable(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>


export default function ProfilePage() {
    const { toast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const isMounted = useRef(false);
    const [isMapOpen, setIsMapOpen] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            fullName: "",
            age: 0,
            biologicalSex: "male",
            weight: 0,
            height: 0,
            deliveryAddress: "",
            region: "",
            activityLevel: undefined,
            mainGoal: undefined,
            photoURL: null,
        },
        mode: "onBlur",
    });
    
    useEffect(() => {
        isMounted.current = true;
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userProfile = await getUserProfile(user.uid);
                    if (userProfile && isMounted.current) {
                        const formValues = {
                            ...userProfile,
                            deliveryAddress: userProfile.deliveryAddress || "",
                            region: userProfile.region || ""
                        };
                        form.reset(formValues as ProfileFormValues);
                        if (userProfile.photoURL) {
                          setProfileImagePreview(userProfile.photoURL);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch user profile", error);
                    toast({
                        title: "Erreur",
                        description: "Impossible de charger votre profil.",
                        variant: "destructive"
                    });
                } finally {
                   if(isMounted.current) setLoading(false);
                }
            } else {
                 router.replace('/welcome');
            }
        });
        return () => {
            unsubscribe();
            isMounted.current = false;
        }
    }, [form, router, toast]);

    const handleAutoSave = async (data: Partial<ProfileFormValues>) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        
        const result = profileFormSchema.safeParse(form.getValues());
        if (!result.success) {
          console.log("Form validation failed:", result.error.flatten().fieldErrors);
          return;
        }

        setSaveStatus("saving");

        try {
            const fullData = result.data;
            const nutritionalNeeds = calculateNutritionalNeeds({
                age: fullData.age,
                gender: fullData.biologicalSex,
                weight: fullData.weight,
                height: fullData.height,
                activityLevel: fullData.activityLevel,
                goal: fullData.mainGoal
            });

            const userProfileData: Partial<User> = {
                ...fullData,
                ...data, // Ensure the latest change is included
                calorieGoal: nutritionalNeeds.calories,
                macroRatio: nutritionalNeeds.macros,
            };
            
            await updateUserProfile(currentUser.uid, userProfileData);
            form.reset(form.getValues(), { keepValues: true, keepDirty: false });
            
            setTimeout(() => setSaveStatus("saved"), 500);
            setTimeout(() => setSaveStatus("idle"), 2000);
        } catch (error) {
            setSaveStatus("idle");
            toast({ title: "Erreur de sauvegarde", description: "Vos modifications n'ont pas pu être enregistrées.", variant: "destructive" });
        }
    };


    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const currentUser = auth.currentUser;
        if (file && currentUser) {
          setSaveStatus("saving");
          const reader = new FileReader();
          reader.onloadend = () => {
            setProfileImagePreview(reader.result as string);
          };
          reader.readAsDataURL(file);

          try {
            const photoURL = await uploadProfileImage(currentUser.uid, file);
            form.setValue("photoURL", photoURL, { shouldDirty: true });
            await handleAutoSave({ ...form.getValues(), photoURL });
          } catch (error) {
            toast({ title: "Erreur de téléversement", description: "L'image n'a pas pu être sauvegardée.", variant: "destructive" });
            setSaveStatus("idle");
          }
        }
    };
    
    const onBlur = (fieldName: keyof ProfileFormValues) => {
        form.trigger(fieldName).then(isValid => {
          if (isValid) {
            handleAutoSave(form.getValues());
          }
        })
    }
    
    const user = form.getValues();

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="bg-primary pb-16">
                <div className="p-4 pt-8">
                    <div className="flex justify-between items-center text-white mb-6">
                        <h1 className="text-xl font-bold">MON PROFIL</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                        <div className="relative cursor-pointer group" onClick={handleImageClick}>
                             <Avatar className="h-20 w-20 border-4 border-white/50">
                                <AvatarImage src={profileImagePreview || user.photoURL || ''} alt={user.fullName} />
                                <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{user.fullName}</h2>
                            <p className="text-white/80 text-sm">
                                {auth.currentUser?.email}
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
                        
                        <Form {...form}>
                            <form className="space-y-6">
                               <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                      control={form.control}
                                      name="age"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Âge</FormLabel>
                                          <FormControl>
                                            <Input type="number" {...field} onBlur={() => onBlur('age')} className="text-center" />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                     <FormField
                                      control={form.control}
                                      name="height"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Taille (cm)</FormLabel>
                                          <FormControl>
                                            <Input type="number" {...field} onBlur={() => onBlur('height')} className="text-center" />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                     <FormField
                                      control={form.control}
                                      name="weight"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Poids (kg)</FormLabel>
                                          <FormControl>
                                            <Input type="number" {...field} onBlur={() => onBlur('weight')} className="text-center" />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                               </div>

                                <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                                    <DialogTrigger asChild>
                                        <div className="space-y-2">
                                            <FormLabel>Adresse de livraison</FormLabel>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <Input
                                                    readOnly
                                                    value={user.deliveryAddress || "Cliquez pour définir l'adresse"}
                                                    className="pl-10 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="w-full h-full max-w-full max-h-full p-0 gap-0">
                                         <DialogTitle className="sr-only">Choisir une adresse</DialogTitle>
                                         <LocationPicker
                                            initialAddress={user.deliveryAddress}
                                            onLocationSelect={(address, region) => {
                                                form.setValue('deliveryAddress', address, { shouldDirty: true });
                                                form.setValue('region', region, { shouldDirty: true });
                                                handleAutoSave({ deliveryAddress: address, region: region });
                                                setIsMapOpen(false); // Close the map
                                            }}
                                            onClose={() => setIsMapOpen(false)}
                                        />
                                    </DialogContent>
                                </Dialog>
                               

                                <FormField
                                  control={form.control}
                                  name="activityLevel"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Niveau d'Activité</FormLabel>
                                      <Select onValueChange={(value) => {
                                          field.onChange(value);
                                          handleAutoSave({ ...form.getValues(), activityLevel: value as any });
                                      }} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Sélectionnez votre niveau d'activité" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="sedentary">Sédentaire</SelectItem>
                                          <SelectItem value="lightly_active">Légèrement actif</SelectItem>
                                          <SelectItem value="moderately_active">Modérément actif</SelectItem>
                                          <SelectItem value="very_active">Très actif</SelectItem>
                                          <SelectItem value="extremely_active">Extrêmement actif</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="mainGoal"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Objectif Principal</FormLabel>
                                      <Select onValueChange={(value) => {
                                          field.onChange(value);
                                          handleAutoSave({ ...form.getValues(), mainGoal: value as any });
                                      }} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Sélectionnez votre objectif principal" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="lose_weight">Perdre du poids</SelectItem>
                                          <SelectItem value="maintain">Maintien</SelectItem>
                                          <SelectItem value="gain_muscle">Prendre du muscle</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                            </form>
                        </Form>

                        <div>
                            <h3 className="font-bold mb-2 mt-8">INTÉGRATIONS</h3>
                            <Button variant="outline" className="w-full h-12">
                                <GoogleIcon className="w-6 h-6 mr-3" />
                                Se connecter à Google Fit
                            </Button>
                        </div>
                        
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
