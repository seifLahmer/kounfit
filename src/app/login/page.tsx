
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
import { signInWithEmailAndPassword, signInWithRedirect } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { getUserRole } from "@/lib/services/roleService";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { GoogleIcon, FacebookIcon, LeafPattern } from "@/components/icons";

const loginSchema = z.object({
  email: z.string().email("Veuillez saisir une adresse e-mail valide."),
  password: z.string().min(1, "Le mot de passe ne peut pas être vide."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex flex-col min-h-screen bg-tertiary relative">
        <LeafPattern className="absolute bottom-0 left-0 w-full h-auto text-white/5 z-0" />
        <header className="flex-shrink-0 h-48 flex items-center justify-center">
            <h1 className="text-5xl font-bold text-white font-heading">Kounfit</h1>
        </header>

        <main className="flex-1 flex flex-col z-10 p-8">
            <h2 className="text-3xl font-bold text-center text-white mb-8 font-heading">Connexion</h2>
            
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                placeholder="E-mail" 
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
                  <Button type="submit" className="w-full h-14 text-lg rounded-button bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                     {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Se connecter
                  </Button>
                </form>
            </Form>

            <div className="text-center my-4">
                <Link href="#" className="text-sm text-white font-semibold hover:underline">
                    Mot de passe oublié ?
                </Link>
            </div>

            <div className="flex items-center my-4">
                <div className="flex-grow border-t border-white/20"></div>
                <span className="mx-4 text-sm text-white/70">ou</span>
                <div className="flex-grow border-t border-white/20"></div>
            </div>

            <div className="flex justify-center gap-4">
                 <Button variant="outline" size="icon" className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm border-white/10 text-white hover:bg-white/30 hover:text-white" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                    <GoogleIcon className="w-7 h-7"/>
                </Button>
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm border-white/10 text-white hover:bg-white/30 hover:text-white" disabled>
                     <FacebookIcon className="w-7 h-7" />
                </Button>
            </div>
            
            <div className="mt-auto text-center text-sm text-white">
                Pas encore de compte ?{" "}
                <Link href="/signup" className="font-semibold text-secondary hover:underline">
                S'inscrire
                </Link>
            </div>
        </main>
    </div>
  );
}
