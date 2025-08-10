
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auth } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/services/userService";
import { calculateNutritionalNeeds } from "@/lib/services/nutritionService";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { LeafPattern } from "@/components/icons";


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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-destructive" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-teal">
        <LeafPattern className="absolute bottom-0 left-0 w-full h-auto text-black/5 z-10" />
        <header className="flex-shrink-0 h-48 flex items-center justify-center">
            <h1 className="text-5xl font-bold text-white">Kounfit</h1>
        </header>

        <main className="flex-1 flex flex-col bg-white rounded-t-3xl z-20 p-8">
            <h2 className="text-3xl font-bold text-center text-brand-teal">Inscription - Étape 2/2</h2>
            <div className="w-16 h-1 bg-brand-teal/20 rounded-full mx-auto my-4 relative">
                <div className="absolute left-0 top-0 h-full w-full bg-brand-teal rounded-full"></div>
            </div>
          
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="biologicalSex"
                      render={({ field }) => (
                        <FormItem className="space-y-3 pt-2">
                          <FormLabel>Vous êtes ?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid grid-cols-2 gap-4"
                            >
                              <FormItem>
                                <FormControl>
                                  <RadioGroupItem value="male" id="male" className="sr-only peer" />
                                </FormControl>
                                <FormLabel htmlFor="male" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    Homme
                                </FormLabel>
                              </FormItem>
                              <FormItem>
                                <FormControl>
                                  <RadioGroupItem value="female" id="female" className="sr-only peer" />
                                </FormControl>
                                <FormLabel htmlFor="female" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    Femme
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="age"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Âge</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} className="h-12 rounded-xl text-center" />
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
                                <Input type="number" {...field} className="h-12 rounded-xl text-center"/>
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
                                <Input type="number" {...field} className="h-12 rounded-xl text-center"/>
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
                                <SelectTrigger className="h-14 rounded-xl">
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
                                <SelectTrigger className="h-14 rounded-xl">
                                <SelectValue placeholder="Sélectionnez votre niveau d'activité" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="sedentary">Sédentaire (peu/pas d'exercice)</SelectItem>
                                <SelectItem value="lightly_active">Léger (1-2 jours/semaine)</SelectItem>
                                <SelectItem value="moderately_active">Modéré (3-5 jours/semaine)</SelectItem>
                                <SelectItem value="very_active">Actif (6-7 jours/semaine)</SelectItem>
                                <SelectItem value="extremely_active">Très actif (travail physique/2x par jour)</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />


                    <Button type="submit" className="w-full h-14 text-lg rounded-xl bg-brand-teal hover:bg-brand-teal/90" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Terminer l'inscription
                    </Button>
                </form>
            </Form>
        </main>
    </div>
  );
}
