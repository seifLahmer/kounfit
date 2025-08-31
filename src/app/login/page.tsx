
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
import { useState, useEffect, useCallback, useRef } from "react";
import { signInWithEmailAndPassword, signInWithRedirect, User as FirebaseUser, getRedirectResult, OAuthProvider, GoogleAuthProvider, linkWithCredential, AuthErrorCodes, fetchSignInMethodsForEmail } from "firebase/auth";
import { auth, db, googleProvider } from "@/lib/firebase";
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication, User as CapacitorFirebaseUser } from '@capacitor-firebase/authentication';
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

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.01,16.23c-1.2,0-2.33-.6-3.43-1.81a5.45,5.45,0,0,1-1.6-4,5.17,5.17,0,0,1,3.13-4.88,5.13,5.13,0,0,1,5.18,1.3,1,1,0,0,0,1.32.13,1,1,0,0,0,.14-1.32A7.14,7.14,0,0,0,12,3.5a7.41,7.41,0,0,0-5.83,3.1,7.2,7.2,0,0,0,1.43,10.29,4.92,4.92,0,0,0,3.3,1.44A5.2,5.2,0,0,0,16.29,17a1,1,0,0,0-.12-1.32,1,1,0,0,0-1.32.13A3.13,3.13,0,0,1,12.01,16.23Z"/>
        <path d="M14.5,3.61a5.24,5.24,0,0,0-2.69.73,5.43,5.43,0,0,0-2.3,2.4,1,1,0,0,0,1.74.9,3.39,3.39,0,0,1,1.52-1.55,3.24,3.24,0,0,1,3.26-.08,1,1,0,0,0,1-1.74A5.23,5.23,0,0,0,14.5,3.61Z"/>
    </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const googleCredentialRef = useRef<any>(null);

  useEffect(() => {
    if(Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      setIsIos(true);
    }
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleUserLogin = useCallback(async (user: FirebaseUser | CapacitorFirebaseUser) => {
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
                router.replace('/signup/step2');
                break;
        }
    } catch (error) {
        console.error("Login handling error:", error);
        toast({ title: "Erreur de connexion", description: "Impossible de vérifier votre rôle ou votre statut.", variant: "destructive" });
        setIsSubmitting(false);
    }
  }, [router, toast]);
  
  useEffect(() => {
    let isMounted = true;
    
    // This function will only run once on mount
    const checkRedirectResult = async () => {
        // Prevent calling getRedirectResult on native platforms
        if (Capacitor.isNativePlatform()) return;

        try {
            const result = await getRedirectResult(auth);
            if (result && result.user && isMounted) {
                setIsSubmitting(true);
                await handleUserLogin(result.user);
            }
        } catch (error: any) {
             if (!isMounted) return;

             if (error.code === AuthErrorCodes.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL) {
                const credential = GoogleAuthProvider.credentialFromError(error);
                if (credential) {
                    googleCredentialRef.current = credential;
                    const email = error.customData.email;
                    if(email) form.setValue('email', email);
                    toast({
                        title: "Compte existant",
                        description: "Ce compte e-mail existe déjà. Veuillez vous connecter avec votre mot de passe pour lier votre compte Google.",
                        variant: "default"
                    });
                }
            } else if (error.code !== 'auth/no-redirect-operation') {
                console.error("Google Redirect Error:", error);
                toast({ title: "Erreur Google", description: "La connexion avec Google a échoué.", variant: "destructive" });
            }
        }
    };
    
    checkRedirectResult();

    return () => {
        isMounted = false;
    };
  }, [handleUserLogin, toast, form]);


  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        
        if (googleCredentialRef.current && userCredential.user) {
             await linkWithCredential(userCredential.user, googleCredentialRef.current);
             googleCredentialRef.current = null;
             toast({ title: "Compte Google lié!", description: "Vous pouvez maintenant vous connecter avec Google."});
        }
        
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
    try {
        if (Capacitor.isNativePlatform()) {
            const result = await FirebaseAuthentication.signInWithGoogle();
            if (result.user) {
              await handleUserLogin(result.user);
            } else {
              setIsSubmitting(false);
            }
        } else {
            await signInWithRedirect(auth, googleProvider);
        }
    } catch (error: any) {
        console.error("Google Sign-In Error:", error);
        if (error.code === AuthErrorCodes.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL) {
            const credential = GoogleAuthProvider.credentialFromError(error);
            if (credential) {
                googleCredentialRef.current = credential;
                const email = error.customData.email;
                if(email) form.setValue('email', email);
                toast({
                    title: "Compte existant",
                    description: "Ce compte e-mail existe déjà. Veuillez vous connecter avec votre mot de passe pour lier votre compte Google.",
                    variant: "default"
                });
            }
        } else {
            toast({
                title: "Erreur de connexion Google",
                description: "Une erreur s'est produite lors de la tentative de connexion avec Google.",
                variant: "destructive",
            });
        }
        setIsSubmitting(false);
    }
  };

   const handleAppleSignIn = async () => {
    setIsSubmitting(true);
    try {
        if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
            const result = await FirebaseAuthentication.signInWithApple();
            if (result.user) {
              await handleUserLogin(result.user);
            } else {
               setIsSubmitting(false);
            }
        } else {
             const provider = new OAuthProvider('apple.com');
             await signInWithRedirect(auth, provider);
        }
    } catch (error) {
        console.error("Apple Sign-In Error:", error);
        toast({
            title: "Erreur de connexion Apple",
            description: "Une erreur s'est produite lors de la tentative de connexion avec Apple.",
            variant: "destructive",
        });
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="w-full max-w-sm mx-auto px-4 py-4 flex-1">
        <div className="text-center mb-6">
            <Image src="/kounfit/kounfit green.png" alt="Kounfit Logo" width={160} height={40} className="mx-auto" />
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
                        <Input type="email" placeholder="Email/nom d'utilisateur" {...field} className="pl-12 h-14 rounded-full border-gray-200" />
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
                            className="pl-12 pr-12 h-14 rounded-full border-gray-200"
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
            <Button type="submit" className="w-full h-14 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 text-white" disabled={isSubmitting}>
               {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Se connecter
            </Button>
          </form>
        </Form>
        <div className="text-center my-4">
            <Link href="#" className="text-sm font-semibold text-gray-600 hover:text-primary">
                Mot de passe oublié ?
            </Link>
        </div>
        <div className="space-y-2">
            <Button variant="outline" className="w-full h-14 rounded-full text-base font-semibold border-gray-200" onClick={handleGoogleSignIn} disabled={isSubmitting}>
            <GoogleIcon className="mr-2 h-5 w-5" /> Continuer avec Google
            </Button>
            {isIos && (
                 <Button variant="outline" className="w-full h-14 rounded-full text-base font-semibold border-gray-200 bg-black text-white hover:bg-gray-800 hover:text-white" onClick={handleAppleSignIn} disabled={isSubmitting}>
                    <AppleIcon className="mr-2 h-5 w-5" /> Continuer avec Apple
                </Button>
            )}
        </div>
      </div>
    </div>
  );
}
