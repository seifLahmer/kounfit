
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Loader2 } from "lucide-react";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auth } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/services/userService";
import { calculateNutritionalNeeds } from "@/lib/services/nutritionService";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged } from "firebase/auth";


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
      age: 0,
      biologicalSex: "male",
      weight: 0,
      height: 0,
      activityLevel: "sedentary",
      mainGoal: "maintain",
    },
  });
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // If no user is logged in, they shouldn't be here.
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
    if (!currentUser) {
        toast({ title: "Erreur", description: "Utilisateur non trouvé. Veuillez vous reconnecter.", variant: "destructive" });
        router.push('/login');
        return;
    }

    try {
      // 1. Calculate nutritional needs
      const nutritionalNeeds = calculateNutritionalNeeds({
          age: data.age,
          gender: data.biologicalSex,
          weight: data.weight,
          height: data.height,
          activityLevel: data.activityLevel,
          goal: data.mainGoal
      });

      // 2. Prepare user data for Firestore update
      const userProfileData = {
          age: data.age,
          biologicalSex: data.biologicalSex,
          weight: data.weight,
          height: data.height,
          activityLevel: data.activityLevel,
          mainGoal: data.mainGoal,
          calorieGoal: nutritionalNeeds.calories,
          macroRatio: nutritionalNeeds.macros,
      };

      // 3. Update user profile in Firestore
      await updateUserProfile(currentUser.uid, userProfileData);

      toast({
        title: "Profil complété!",
        description: "Bienvenue sur NutriTrack! Vous allez être redirigé.",
      });

      // 4. Redirect to home page
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
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link href="/welcome" className="flex justify-center items-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-destructive" />
            <span className="text-2xl font-bold">NutriTrack</span>
          </Link>
          <CardTitle className="text-2xl">Finalisez votre profil (Étape 2/2)</CardTitle>
          <CardDescription>Ces informations nous aideront à personnaliser votre expérience.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Âge</Label>
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
                    <FormItem className="space-y-3 pt-2">
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
                      <Label>Poids (kg)</Label>
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
                      <Label>Taille (cm)</Label>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau d'Activité Physique</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre niveau d'activité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sédentaire (peu ou pas d'exercice)</SelectItem>
                        <SelectItem value="lightly_active">Légèrement actif (exercice léger 1-3j/semaine)</SelectItem>
                        <SelectItem value="moderately_active">Modérément actif (exercice modéré 3-5j/semaine)</SelectItem>
                        <SelectItem value="very_active">Très actif (exercice intense 6-7j/semaine)</SelectItem>
                        <SelectItem value="extremely_active">Extrêmement actif (exercice très intense)</SelectItem>
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
                          <SelectValue placeholder="Sélectionnez votre objectif" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lose_weight">Perdre du poids (Sèche)</SelectItem>
                        <SelectItem value="maintain">Maintien du poids</SelectItem>
                        <SelectItem value="gain_muscle">Prendre du muscle (Prise de masse)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={loading}>
                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Sauvegarde..." : "Terminer et commencer"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
