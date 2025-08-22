
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithRedirect, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { GoogleIcon, LeafPattern } from "@/components/icons";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <div className="flex flex-col min-h-screen bg-tertiary relative">
        <LeafPattern className="absolute bottom-0 left-0 w-full h-auto text-white/5 z-0" />
        <header className="flex-shrink-0 h-48 flex items-center justify-center">
            <h1 className="text-5xl font-bold text-white font-heading">Kounfit</h1>
        </header>

        <main className="flex-1 flex flex-col z-10 p-8">
            <h2 className="text-3xl font-bold text-center text-white font-heading">Inscription - Étape 1/2</h2>
             <div className="w-16 h-1 bg-white/20 rounded-full mx-auto my-4 relative">
                <div className="absolute left-0 top-0 h-full w-1/2 bg-primary rounded-full"></div>
            </div>
            
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                   <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/80" />
                            <Input 
                                placeholder="Nom complet" 
                                className="pl-12 h-14 rounded-button bg-white/20 backdrop-blur-sm border-white/10 text-white placeholder:text-white/70 focus:bg-white/30"
                                {...field} 
                             />
                          </div>
                        </FormControl>
                        <FormMessage className="text-secondary" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                           <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/80" />
                            <Input 
                                type="email"
                                placeholder="Email"
                                className="pl-12 h-14 rounded-button bg-white/20 backdrop-blur-sm border-white/10 text-white placeholder:text-white/70 focus:bg-white/30"
                                {...field}
                             />
                          </div>
                        </FormControl>
                        <FormMessage className="text-secondary" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/80" />
                            <Input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Mot de passe"
                                className="pl-12 pr-12 h-14 rounded-button bg-white/20 backdrop-blur-sm border-white/10 text-white placeholder:text-white/70 focus:bg-white/30"
                                {...field}
                             />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-secondary" />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/80" />
                            <Input 
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirmer mot de passe"
                                className="pl-12 pr-12 h-14 rounded-button bg-white/20 backdrop-blur-sm border-white/10 text-white placeholder:text-white/70 focus:bg-white/30"
                                {...field}
                             />
                            <button 
                                type="button" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-secondary" />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-14 text-lg rounded-button bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                     {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Continuer
                  </Button>
                </form>
            </Form>

            <div className="flex items-center my-4">
                <div className="flex-grow border-t border-white/20"></div>
                <span className="mx-4 text-sm text-white/70">ou</span>
                <div className="flex-grow border-t border-white/20"></div>
            </div>
            
            <Button variant="outline" className="w-full h-14 rounded-button flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm border-white/10 text-white hover:bg-white/30 hover:text-white" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                <GoogleIcon className="w-6 h-6"/>
                <span className="text-base font-semibold">S'inscrire avec Google</span>
            </Button>
            
            <div className="mt-auto text-center text-sm pt-4 text-white">
                Déjà un compte ?{" "}
                <Link href="/login" className="font-semibold text-secondary hover:underline">
                Se connecter
                </Link>
            </div>
        </main>
    </div>
  );
}
