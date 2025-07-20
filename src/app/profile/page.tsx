
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Camera } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
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
import { toast } from "@/hooks/use-toast"
import { updateUserProfile } from "@/lib/services/userService"
import { auth } from "@/lib/firebase"
import { useState } from "react"
import { Loader2 } from "lucide-react"

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
  activityLevel: z.string({
    required_error: "Veuillez sélectionner un niveau d'activité.",
  }),
  mainGoal: z.string({
    required_error: "Veuillez sélectionner un objectif principal.",
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const defaultValues: Partial<ProfileFormValues> = {
  fullName: "zakaria ben hajji",
  age: 30,
  biologicalSex: "male",
  weight: 80,
  height: 180,
  deliveryAddress: "Rue de Russie, Ariana",
  region: "Tunis",
  activityLevel: "moderately_active",
  mainGoal: "maintain",
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  })

  async function onSubmit(data: ProfileFormValues) {
    setLoading(true);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour mettre à jour votre profil.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      await updateUserProfile(currentUser.uid, data);
      toast({
        title: "Profil mis à jour !",
        description: "Vos informations ont été enregistrées avec succès.",
      })
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Une erreur s'est produite lors de la mise à jour de votre profil.",
        variant: "destructive",
      })
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout>
      <div className="p-4 space-y-6 max-w-lg mx-auto pb-24">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                   <Camera className="w-12 h-12 text-gray-400" />
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-red-500 text-white rounded-full p-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                  </svg>
                </button>
              </div>
               <button type="button" className="text-red-500 font-semibold">Ajouter photo</button>
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
                      defaultValue={field.value}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 text-lg">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Sauvegarde..." : "Sauvegarder les changements"}
            </Button>
          </form>
        </Form>
      </div>
    </MainLayout>
  )
}
