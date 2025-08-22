
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { auth } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/services/userService";
import { calculateNutritionalNeeds } from "@/lib/services/nutritionService";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2 } from "lucide-react";

const step2Schema = z.object({
  age: z.coerce.number().min(16, "Vous devez avoir au moins 16 ans.").max(120),
  biologicalSex: z.enum(["male", "female"], {
    required_error: "Veuillez sélectionner votre sexe.",
  }),
  weight: z.coerce.number().min(30, "Le poids doit être un nombre positif."),
  height: z.coerce.number().min(100, "La taille doit être un nombre positif."),
   activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"],{
    required_error: "Veuillez sélectionner un niveau d'activité.",
  }),
  mainGoal: z.enum(["lose_weight", "maintain", "gain_muscle"], {
    required_error: "Veuillez sélectionner un objectif principal.",
  }),
});

type Step2FormValues = z.infer<typeof step2Schema>;

export default function SignupStep2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);

  const form = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      age: 18,
      biologicalSex: "male",
      weight: 70,
      height: 175,
      activityLevel: "lightly_active",
      mainGoal: "maintain",
    },
  });
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
      } else {
         setIsAuthCheckComplete(true);
      }
    });

    return () => unsubscribe();
  }, [router]);


  const onSubmit = async (data: Step2FormValues) => {
    setLoading(true);
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
        toast({ title: "Erreur", description: "Utilisateur non trouvé ou informations manquantes. Veuillez vous reconnecter.", variant: "destructive" });
        router.push('/login');
        return;
    }

    try {
      const nutritionalNeeds = calculateNutritionalNeeds({
          age: data.age,
          gender: data.biologicalSex,
          weight: data.weight,
          height: data.height,
          activityLevel: data.activityLevel,
          goal: data.mainGoal
      });
      
      const userProfileData = {
          fullName: currentUser.displayName || 'Utilisateur',
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          role: 'client' as const,
          age: data.age,
          biologicalSex: data.biologicalSex,
          weight: data.weight,
          height: data.height,
          activityLevel: data.activityLevel,
          mainGoal: data.mainGoal,
          calorieGoal: nutritionalNeeds.calories,
          macroRatio: nutritionalNeeds.macros,
      };

      await updateUserProfile(currentUser.uid, userProfileData);

      toast({
        title: "Profil complété!",
        description: "Bienvenue sur Kounfit! Vous allez être redirigé.",
      });

      router.push("/home");

    } catch (error: any) {
       console.error("Signup Step 2 Error:", error);
       toast({
         title: "Erreur",
         description: "Impossible de sauvegarder votre profil. Veuillez réessayer.",
         variant: "destructive",
       });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthCheckComplete) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8F7] flex flex-col">
       <div className="relative bg-gradient-to-b from-[#22C58B] to-[#4FD6B3] text-white pb-10" style={{ clipPath: 'ellipse(100% 70% at 50% 30%)' }}>
            <div className="text-center pt-10 px-4 space-y-4">
                <div className="flex items-center justify-between">
                    <Image src="/kounfit-logo-white-s.png" alt="Kounfit Logo" width={40} height={40} />
                    <h2 className="text-2xl font-semibold absolute left-1/2 -translate-x-1/2">Inscription - Étape 2/2</h2>
                </div>
                <div className="w-full max-w-sm mx-auto pt-4">
                   <p className="text-white/80">Ces informations nous aideront à personnaliser votre expérience.</p>
                </div>
            </div>
        </div>

      <div className="w-full max-w-md mx-auto px-4 flex-1 -mt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="biologicalSex"
              render={({ field }) => (
                <FormItem className="space-y-3 bg-white p-4 rounded-xl shadow-sm">
                  <FormLabel>Vous êtes</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="male" id="male" />
                        </FormControl>
                        <FormLabel htmlFor="male">Homme</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="female" id="female" />
                        </FormControl>
                        <FormLabel htmlFor="female">Femme</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Âge</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="25" {...field} className="h-12 bg-white"/>
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
                      <Input type="number" placeholder="175" {...field} className="h-12 bg-white" />
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
                      <Input type="number" placeholder="70" {...field} className="h-12 bg-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="mainGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quel est votre objectif principal ?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-white">
                        <SelectValue placeholder="Sélectionnez votre objectif" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lose_weight">Perdre du poids</SelectItem>
                      <SelectItem value="maintain">Maintien du poids</SelectItem>
                      <SelectItem value="gain_muscle">Prendre du muscle</SelectItem>
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
                  <FormLabel>Votre niveau d'activité quotidien</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-white">
                        <SelectValue placeholder="Sélectionnez votre niveau d'activité" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sedentary">Sédentaire (peu ou pas d'exercice)</SelectItem>
                      <SelectItem value="lightly_active">Légèrement actif (exercice léger 1-3 jours/semaine)</SelectItem>
                      <SelectItem value="moderately_active">Modérément actif (exercice modéré 3-5 jours/semaine)</SelectItem>
                      <SelectItem value="very_active">Très actif (exercice intense 6-7 jours/semaine)</SelectItem>
                       <SelectItem value="extremely_active">Extrêmement actif (travail physique & exercice intense)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />


            <Button type="submit" className="w-full h-14 text-lg font-semibold rounded-xl bg-[#0B7E58] hover:bg-[#0a6e4d]" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Terminer
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
