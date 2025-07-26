
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Camera, Loader2, CheckCircle } from "lucide-react"
import Image from "next/image"
import * as React from "react"
import { useCallback, useEffect, useState, useRef } from "react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
  activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active"], {
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
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const userProfile = await getUserProfile(user.uid);
                if (userProfile) {
                    form.reset(userProfile as ProfileFormValues);
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
                setLoading(false);
            }
        } else {
             router.replace('/welcome');
        }
    });
    return () => unsubscribe();
  }, [form, router, toast]);


  const handleAutoSave = useCallback(async (data: ProfileFormValues) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        toast({ title: "Erreur", description: "Utilisateur non authentifié.", variant: "destructive" });
        return;
    }
    
    setSaveStatus("saving");

    try {
        const nutritionalNeeds = calculateNutritionalNeeds({
            age: data.age,
            gender: data.biologicalSex,
            weight: data.weight,
            height: data.height,
            activityLevel: data.activityLevel,
            goal: data.mainGoal
        });

        const userProfileData: Partial<User> = {
            ...data,
            calorieGoal: nutritionalNeeds.calories,
            macroRatio: nutritionalNeeds.macros,
        };
        
        await updateUserProfile(currentUser.uid, userProfileData);
        
        setTimeout(() => setSaveStatus("saved"), 500);
        setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
        setSaveStatus("idle");
        toast({ title: "Erreur de sauvegarde", description: "Vos modifications n'ont pas pu être enregistrées.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    if (!loading) {
        isMounted.current = true;
    }
  }, [loading]);

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (isMounted.current && form.formState.isDirty && form.formState.isValid) {
        handleAutoSave(value as ProfileFormValues);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, handleAutoSave, isMounted]);


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
        form.setValue("photoURL", photoURL, { shouldDirty: true, shouldValidate: true });
      } catch (error) {
        toast({ title: "Erreur de téléversement", description: "L'image n'a pas pu être sauvegardée.", variant: "destructive" });
        setSaveStatus("idle");
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 space-y-6 max-w-lg mx-auto pb-24">
        <Form {...form}>
          <form className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
               <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <div className="relative cursor-pointer group" onClick={handleImageClick}>
                 <div className="relative w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                   {profileImagePreview ? (
                      <Image src={profileImagePreview} alt="Profile preview" layout="fill" objectFit="cover" />
                   ) : (
                      <Camera className="w-12 h-12 text-gray-400" />
                   )}
                </div>
                <div
                  className="absolute bottom-1 right-1 bg-red-500 text-white rounded-full p-2 group-hover:bg-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                  </svg>
                </div>
              </div>
               <button type="button" className="text-red-500 font-semibold" onClick={handleImageClick}>
                {profileImagePreview ? "Changer la photo" : "Ajouter photo"}
               </button>
            </div>

            <div className="h-6 flex items-center justify-center">
              {saveStatus === "saving" && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</div>}
              {saveStatus === "saved" && <div className="flex items-center text-sm text-green-600"><CheckCircle className="mr-2 h-4 w-4" />Modifications enregistrées!</div>}
            </div>
            
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom Complet</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Âge (années)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="biologicalSex"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Sexe Biologique</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex items-center space-x-6"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="male" />
                        </FormControl>
                        <FormLabel className="font-normal">Homme</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="female" />
                        </FormControl>
                        <FormLabel className="font-normal">Femme</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
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
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
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
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="deliveryAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse de livraison</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Rue de Russie, Ariana" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Région/Ville</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Tunis" />
                  </FormControl>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre objectif principal" />
                      </Trigger>
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
      </div>
    </MainLayout>
  )
}
