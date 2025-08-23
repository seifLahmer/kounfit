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
import { addCaterer } from "@/lib/services/catererService";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2, Check, MapPin, Building } from "lucide-react";
import { LeafPattern } from "@/components/icons";
import Image from "next/image";
import { updateUserProfile } from "@/lib/services/userService";


const catererStep2Schema = z.object({
  restaurantName: z.string().min(2, "Le nom du restaurant est requis."),
  region: z.string({
    required_error: "Veuillez sélectionner votre région."
  }),
});

type CatererStep2FormValues = z.infer<typeof catererStep2Schema>;

export default function SignupCatererStep2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);

  const form = useForm<CatererStep2FormValues>({
    resolver: zodResolver(catererStep2Schema),
    defaultValues: {
      restaurantName: "",
      region: "tunis",
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

  const onSubmit = async (data: CatererStep2FormValues) => {
    setLoading(true);
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
        toast({ title: "Erreur", description: "Utilisateur non trouvé. Veuillez vous reconnecter.", variant: "destructive" });
        router.push('/login');
        return;
    }

    try {
      await addCaterer({
          uid: currentUser.uid,
          name: data.restaurantName,
          email: currentUser.email,
          region: data.region,
          status: 'pending' // Set default status
      });

      // also update the user's role in the generic users collection for role checks
      await updateUserProfile(currentUser.uid, { role: 'caterer' });

      router.push("/signup/pending-approval");

    } catch (error: any) {
       console.error("Signup Caterer Step 2 Error:", error);
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
          <Image src="/kounfit.png" alt="Kounfit Logo" width={40} height={40} className="mx-auto" />
          <h2 className="text-2xl font-bold">Inscription Traiteur</h2>
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
              <FormField
                control={form.control}
                name="restaurantName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                          <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input placeholder="Nom du restaurant" {...field} className="pl-12 h-14 bg-white/50 rounded-xl" />
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
                                <SelectValue placeholder="Sélectionnez votre région" />
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
