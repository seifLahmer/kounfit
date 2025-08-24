
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
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useState, useEffect, useCallback } from "react";
import { signInWithEmailAndPassword, signInWithRedirect, User as FirebaseUser, getRedirectResult } from "firebase/auth";
import { auth, db, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { getUserRole } from "@/lib/services/roleService";
import { Loader2, Mail, Eye, EyeOff } from "lucide-react";
import { GoogleIcon, LockIcon } from "@/components/icons";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().email("Veuillez saisir une adresse e-mail valide."),
  password: z.string().min(1, "Le mot de passe ne peut pas être vide."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleUserLogin = useCallback(async (user: FirebaseUser) => {
    setIsSubmitting(true);
    try {
        const role = await getUserRole(user.uid);

        if (role === 'caterer' || role === 'delivery') {
            const collectionName = role === 'caterer' ? 'caterers' : 'deliveryPeople';
            const docRef = doc(db, collectionName, user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const status = docSnap.data().status;
                if (status === 'pending') {
                    router.replace('/signup/pending-approval');
                    return;
                }
                if (status === 'rejected') {
                    await auth.signOut();
                    toast({ title: "Accès refusé", description: "Votre compte a été rejeté.", variant: "destructive"});
                    setIsSubmitting(false);
                    return;
                }
            }
        }
        
        switch (role) {
            case 'admin':
                router.replace('/admin');
                break;
            case 'caterer':
                router.replace('/caterer');
                break;
            case 'delivery':
                router.replace('/delivery');
                break;
            case 'client':
                router.replace('/home');
                break;
            default:
                // New user (from Google sign-in for example)
                router.replace('/signup/step2');
                break;
        }
    } catch (error) {
        console.error("Login handling error:", error);
        toast({ title: "Erreur", description: "Impossible de vérifier votre rôle.", variant: "destructive" });
        setIsSubmitting(false);
    }
  }, [router, toast]);
  
  // Handle redirect from Google
  useEffect(() => {
    const handleRedirect = async () => {
        setIsSubmitting(true);
        try {
            const result = await getRedirectResult(auth);
            if (result) {
                await handleUserLogin(result.user);
            } else {
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Google Redirect Error:", error);
            toast({ title: "Erreur Google", description: "La connexion avec Google a échoué.", variant: "destructive" });
            setIsSubmitting(false);
        }
    };
    handleRedirect();
  }, [handleUserLogin, toast]);


  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        await handleUserLogin(userCredential.user);
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
    <div className="flex flex-col min-h-screen bg-background">
        <div className="relative w-full h-1/3">
            <Image 
                src="https://placehold.co/600x400.png"
                alt="Bol de nourriture saine"
                layout="fill"
                objectFit="cover"
                data-ai-hint="healthy food bowl"
            />
             <div 
                className="absolute bottom-0 left-0 w-full h-16 bg-background"
                style={{ clipPath: 'ellipse(70% 100% at 50% 100%)' }}
            ></div>
        </div>

      <div className="w-full max-w-sm mx-auto px-4 -mt-8 flex-1">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-tertiary">Kounfit</h1>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input type="email" placeholder="Email au nom d'utilisateur" {...field} className="pl-12 h-14 rounded-xl" />
                    </div>
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
                  <FormControl>
                    <div className="relative">
                        <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input 
                            type={passwordVisible ? 'text' : 'password'}
                            placeholder="Mot de passe" 
                            {...field} 
                            className="pl-12 pr-12 h-14 rounded-xl"
                        />
                         <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {passwordVisible ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-14 text-lg font-semibold rounded-xl bg-secondary hover:bg-secondary/90 text-white" disabled={isSubmitting}>
               {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Se connecter
            </Button>
          </form>
        </Form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou se connecter avec
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full h-14 rounded-xl text-base font-semibold" onClick={handleGoogleSignIn} disabled={isSubmitting}>
          <GoogleIcon className="mr-2 h-5 w-5" /> Google
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
