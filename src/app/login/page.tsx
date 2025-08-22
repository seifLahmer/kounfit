
"use client";

import Link from "next/link";
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
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithRedirect } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { getUserRole } from "@/lib/services/roleService";
import { Loader2 } from "lucide-react";
import { GoogleIcon } from "@/components/icons";

const loginSchema = z.object({
  email: z.string().email("Veuillez saisir une adresse e-mail valide."),
  password: z.string().min(1, "Le mot de passe ne peut pas être vide."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;
        
        await new Promise(resolve => setTimeout(resolve, 100));

        const role = await getUserRole(user.uid);
        
        toast({ title: "Connexion réussie!", description: "Redirection en cours..." });

        if (role === 'admin') {
            router.push('/admin');
        } else if (role === 'caterer') {
            router.push('/caterer');
        } else {
            router.push('/home');
        }

    } catch (error: any) {
        console.error("Login Error:", error);
        let description = "Une erreur inconnue s'est produite. Veuillez réessayer.";
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            description = "L'adresse e-mail ou le mot de passe est incorrect. Veuillez vérifier vos informations.";
        }
        toast({
            title: "Échec de la connexion",
            description: description,
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

   const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    await signInWithRedirect(auth, googleProvider).catch((error) => {
       toast({
          title: "Erreur de connexion Google",
          description: "Impossible de démarrer la connexion avec Google.",
          variant: "destructive",
       });
       setIsSubmitting(false);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">KOUNFIT</h1>
          <p className="text-muted-foreground">Bon retour parmi nous !</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemple.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
               {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
          </form>
        </Form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-50 px-2 text-muted-foreground">
              Ou continuer avec
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
          <GoogleIcon className="mr-2 h-4 w-4" /> Google
        </Button>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Pas encore de compte?{" "}
          <Link href="/signup" className="underline font-semibold text-primary">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
