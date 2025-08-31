
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Camera, Loader2, CheckCircle, LogOut, MapPin, Check, Snowflake, Activity } from "lucide-react"
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
import { handleGoogleFitSignIn, checkGoogleFitPermission } from "@/lib/services/googleFitService"
import { cn } from "@/lib/utils"


const profileFormSchema = z.object({
  fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  age: z.coerce.number().min(16, "Vous devez avoir au moins 16 ans.").max(120),
  biologicalSex: z.enum(["male", "female"], {
    required_error: "Veuillez sélectionner votre sexe.",
  }),
  weight: z.coerce.number().min(30, "Le poids doit être un nombre positif."),
  height: z.coerce.number().min(100, "La taille doit être un nombre positif."),
  region: z.string({ required_error: "Veuillez sélectionner une région." }),
  activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"], {
    required_error: "Veuillez sélectionner un niveau d'activité.",
  }),
  mainGoal: z.enum(["lose_weight", "maintain", "gain_muscle"], {
    required_error: "Veuillez sélectionner un objectif principal.",
  }),
  photoURL: z.string().url().optional().nullable(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>


const IntegrationCard = ({ icon, name, isConnected, isConnecting, onClick, disabled = false }: { icon: React.ReactNode, name: string, isConnected?: boolean, isConnecting?: boolean, onClick?: () => void, disabled?: boolean }) => {
    return (
        <Card 
            className={cn(
                "w-full aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                isConnected ? "bg-primary text-primary-foreground border-primary" : "bg-muted hover:bg-border",
                (disabled || isConnecting) && "opacity-50 cursor-not-allowed"
            )}
            onClick={disabled || isConnecting ? undefined : onClick}
        >
            {isConnecting ? <Loader2 className="h-6 w-6 animate-spin" /> : icon}
            <span className="text-xs font-semibold">{name}</span>
            {isConnected && <CheckCircle className="w-4 h-4 absolute top-1 right-1" />}
        </Card>
    )
}

export default function ProfilePage() {
    const { toast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const isMounted = useRef(false);
    const [isFitConnected, setIsFitConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            fullName: "",
            age: 0,
            biologicalSex: "male",
            weight: 0,
            height: 0,
            region: "tunis",
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
                            region: userProfile.region || "tunis"
                        };
                        form.reset(formValues as ProfileFormValues);
                        if (userProfile.photoURL) {
                          setProfileImagePreview(userProfile.photoURL);
                        }
                    }
                    const hasPermission = await checkGoogleFitPermission();
                    if(isMounted.current) setIsFitConnected(hasPermission);

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

    const handleConnectToFit = async () => {
      setIsConnecting(true);
      try {
        await handleGoogleFitSignIn();
        setIsFitConnected(true);
        toast({
          title: "Connecté à Google Fit!",
          description: "Votre compte est maintenant lié.",
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Erreur de connexion",
          description: "Impossible de se connecter à Google Fit.",
          variant: "destructive"
        });
      } finally {
        setIsConnecting(false);
      }
    };

    const handleRegionChange = (newRegion: string) => {
        const oldRegion = form.getValues('region');
        if (newRegion !== oldRegion) {
            localStorage.removeItem('dailyPlanData');
            toast({
                title: "Panier vidé",
                description: "Votre panier a été réinitialisé car vous avez changé de région.",
            });
        }
    }

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
                ...data, 
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
                               
                               <FormField
                                  control={form.control}
                                  name="region"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Région</FormLabel>
                                      <Select onValueChange={(value) => {
                                          handleRegionChange(value);
                                          field.onChange(value);
                                          handleAutoSave({ ...form.getValues(), region: value as any });
                                      }} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Sélectionnez votre région de livraison" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="tunis">Tunis</SelectItem>
                                            <SelectItem value="ariana">Ariana</SelectItem>
                                            <SelectItem value="ben arous">Ben Arous</SelectItem>
                                            <SelectItem value="manouba">La Manouba</SelectItem>
                                            <SelectItem value="nabeul">Nabeul</SelectItem>
                                            <SelectItem value="sousse">Sousse</SelectItem>
                                            <SelectItem value="sfax">Sfax</SelectItem>
                                            <SelectItem value="bizerte">Bizerte</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

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
                             <div className="grid grid-cols-3 gap-3">
                                 <IntegrationCard 
                                     name="Fit"
                                     icon={<GoogleIcon className="w-8 h-8"/>}
                                     isConnected={isFitConnected}
                                     isConnecting={isConnecting}
                                     onClick={handleConnectToFit}
                                 />
                                 <IntegrationCard 
                                     name="Huawei"
                                     icon={<Image src="https://unpkg.com/lucide-static@latest/icons/smartphone.svg" width={32} height={32} alt="Huawei Icon" />}
                                     disabled
                                 />
                                 <IntegrationCard 
                                     name="Fitbit"
                                     icon={<Image src="https://unpkg.com/lucide-static@latest/icons/activity.svg" width={32} height={32} alt="Fitbit Icon" />}
                                     disabled
                                 />
                                 <IntegrationCard 
                                     name="Garmin"
                                      icon={<Image src="https://unpkg.com/lucide-static@latest/icons/navigation.svg" width={32} height={32} alt="Garmin Icon" />}
                                     disabled
                                 />
                                 <IntegrationCard
                                     name="Polar"
                                     icon={<Snowflake className="w-8 h-8" />}
                                     disabled
                                 />
                                 <IntegrationCard
                                     name="S-Health"
                                     icon={<Activity className="w-8 h-8" />}
                                     disabled
                                 />
                             </div>
                         </div>
                        
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
