
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
import { createUserWithEmailAndPassword, signInWithRedirect, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { GoogleIcon } from "@/components/icons";

const signupSchema = z.object({
  fullName: z.string().min(2, "Le nom complet doit comporter au moins 2 caractères."),
  email: z.string().email("Veuillez saisir une adresse e-mail valide."),
  password: z.string().min(6, "Le mot de passe doit comporter au moins 6 caractères."),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});


type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      await updateProfile(userCredential.user, {
          displayName: data.fullName
      });

      router.push('/signup/step2');

    } catch (error: any) {
       console.error("Signup Error:", error);
       let description = "Une erreur s'est produite lors de l'inscription.";
       if (error.code === 'auth/email-already-in-use') {
         description = "Cette adresse e-mail est déjà utilisée. Veuillez essayer de vous connecter.";
       }
       toast({
         title: "Erreur d'inscription",
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
           description: "Une erreur s'est produite lors de la tentative de connexion avec Google.",
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
          <p className="text-muted-foreground">Créez votre compte pour commencer.</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom Complet</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Jean Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
             <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmez le mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              S'inscrire
            </Button>
          </form>
        </Form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-50 px-2 text-muted-foreground">
              Ou s'inscrire avec
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
          <GoogleIcon className="mr-2 h-4 w-4" /> Google
        </Button>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Déjà un compte?{" "}
          <Link href="/login" className="underline font-semibold text-primary">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
