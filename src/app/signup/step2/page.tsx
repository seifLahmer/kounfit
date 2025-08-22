
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
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
import { Loader2, Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeafPattern, HeightIcon, WeightIcon, AgeIcon, ActivityIcon } from "@/components/icons";

const step2Schema = z.object({
  height: z.coerce.number().min(100, "La taille doit être un nombre positif."),
  weight: z.coerce.number().min(30, "Le poids doit être un nombre positif."),
  age: z.coerce.number().min(16, "Vous devez avoir au moins 16 ans.").max(120),
  biologicalSex: z.enum(["male", "female"], {
    required_error: "Veuillez sélectionner votre sexe.",
  }),
  region: z.string({
    required_error: "Veuillez sélectionner votre région."
  }),
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
      height: 175,
      weight: 70,
      age: 25,
      biologicalSex: "male",
      region: "tunis",
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
        toast({ title: "Erreur", description: "Utilisateur non trouvé. Veuillez vous reconnecter.", variant: "destructive" });
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
          region: data.region,
          activityLevel: data.activityLevel,
          mainGoal: data.mainGoal,
          calorieGoal: nutritionalNeeds.calories,
          macroRatio: nutritionalNeeds.macros,
      };

      await updateUserProfile(currentUser.uid, userProfileData);

      toast({
        title: "Profil complété!",
        description: "Bienvenue ! Vous allez être redirigé.",
      });

      router.push("/home");

    } catch (error: any) {
       console.error("Signup Step 2 Error:", error);
       toast({
         title: "Erreur",
         description: "Impossible de sauvegarder votre profil.",
         variant: "destructive",
       });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthCheckComplete) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-[#F6F8F7]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8F7] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <LeafPattern className="absolute inset-0 w-full h-full text-gray-400/50" />
      <div className="relative w-full max-w-lg bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl flex flex-col">
        <div className="bg-gradient-to-b from-[#22C58B] to-[#0B7E58] rounded-t-3xl text-white text-center p-6 space-y-3 rounded-b-2xl">
          <h1 className="text-xl font-semibold">Kounfit</h1>
          <h2 className="text-2xl font-bold">Inscription Client</h2>
          <p className="text-lg font-medium">– Etape 2/2 –</p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="w-16 h-px bg-white/30"></div>
            <div className="w-5 h-5 bg-white/30 rounded-full"></div>
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[#0B7E58]">
              <Check size={14} strokeWidth={3} />
            </div>
            <div className="w-16 h-px bg-white/30"></div>
          </div>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center bg-white/50 rounded-xl p-3 h-14">
                          <HeightIcon className="text-gray-500" />
                          <span className="ml-3 font-medium text-gray-700">Taille</span>
                          <Input type="number" {...field} className="text-right border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none w-16" />
                          <span className="text-gray-500">cm</span>
                        </div>
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
                      <FormControl>
                        <div className="flex items-center bg-white/50 rounded-xl p-3 h-14">
                          <WeightIcon className="text-gray-500" />
                          <span className="ml-3 font-medium text-gray-700">Poids</span>
                          <Input type="number" {...field} className="text-right border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none w-16" />
                          <span className="text-gray-500">kg</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center bg-white/50 rounded-xl p-3 h-14">
                        <AgeIcon className="text-gray-500" />
                        <span className="ml-3 font-medium text-gray-700">Age</span>
                        <Input type="number" {...field} className="text-right border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none w-24" />
                      </div>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/50 rounded-xl p-3 h-14 border-none">
                            <div className="flex items-center gap-3">
                                <MapPin className="text-gray-500 h-6 w-6" />
                                <SelectValue />
                            </div>
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
                     <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/50 rounded-xl p-3 h-14 border-none">
                            <div className="flex items-center gap-3">
                                <ActivityIcon className="text-gray-500" />
                                <SelectValue />
                            </div>
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
                     <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/50 rounded-xl p-3 h-14 border-none">
                             <SelectValue />
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

              <FormField
                control={form.control}
                name="biologicalSex"
                render={({ field }) => (
                  <FormItem>
                     <div className="flex items-center justify-between bg-white/50 rounded-xl p-3 h-14">
                        <span className="ml-3 font-medium text-gray-700">Genre</span>
                        <div className="flex items-center gap-2">
                           <Button
                            type="button"
                            onClick={() => field.onChange("male")}
                            className={cn(
                                "rounded-full transition",
                                field.value === "male" ? "bg-[#0B7E58] text-white" : "bg-gray-200 text-gray-600"
                            )}
                            >
                                Homme
                            </Button>
                             <Button
                            type="button"
                            onClick={() => field.onChange("female")}
                             className={cn(
                                "rounded-full transition",
                                field.value === "female" ? "bg-[#0B7E58] text-white" : "bg-gray-200 text-gray-600"
                            )}
                            >
                                Femme
                            </Button>
                        </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-14 text-lg font-semibold rounded-full bg-secondary hover:bg-secondary/90 text-white" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Terminer
              </Button>
              <Button type="button" variant="link" className="w-full text-muted-foreground" onClick={() => router.back()}>Retour</Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

    