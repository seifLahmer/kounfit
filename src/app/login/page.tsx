
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
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithRedirect, onAuthStateChanged, User } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { getUserRole } from "@/lib/services/roleService";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password cannot be empty."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.3v2.84C4.02 20.44 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.3C1.46 8.85 1 10.42 1 12s.46 3.15 1.3 4.93l3.54-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4.02 3.56 2.3 6.96l3.54 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // This hook now only checks if a user is already logged in.
  // If so, it redirects them. If not, it allows the page to render.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // A user is already signed in, so redirect them away from the login page.
        await handleRedirect(user);
      } else {
        // No user is signed in. Stop loading and show the form.
        setIsAuthChecking(false);
      }
    });
    return () => unsubscribe();
  }, [router]); // dependency on router to use it inside handleRedirect

  const handleRedirect = async (user: User) => {
    const role = await getUserRole(user.uid);
    if (role === 'admin') router.replace('/admin');
    else if (role === 'caterer') router.replace('/caterer');
    else router.replace('/home');
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      // After successful sign-in, the onAuthStateChanged listener will handle the redirect.
    } catch (error: any) {
      let description = "An error occurred during login.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "Email ou mot de passe invalide. Veuillez réessayer ou créer un compte.";
      }
      toast({
        title: "Échec de la connexion",
        description: description,
        variant: "destructive",
      });
      setIsSubmitting(false); // Only set to false on error, success will unmount the component
    }
  };

  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    signInWithRedirect(auth, googleProvider).catch((error) => {
       toast({
          title: "Erreur de connexion Google",
          description: "Impossible de démarrer la connexion avec Google.",
          variant: "destructive",
       });
       setIsSubmitting(false);
    });
  };

  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-destructive" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
           <Link href="/welcome" className="flex justify-center items-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-destructive" />
            <span className="text-2xl font-bold">FITHELATH</span>
          </Link>
          <CardTitle className="text-2xl">Content de vous revoir!</CardTitle>
          <CardDescription>Entrez vos identifiants pour accéder à votre compte.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label>Email</Label>
                    <FormControl>
                      <Input type="email" placeholder="nom@exemple.com" {...field} />
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
                    <div className="flex items-center justify-between">
                      <Label>Mot de passe</Label>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isSubmitting}>
                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Se connecter
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <Separator />
            <div className="absolute inset-0 flex items-center">
                <span className="bg-card px-2 text-sm text-muted-foreground mx-auto">OU</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
            <GoogleIcon />
            <span className="ml-2">Continuer avec Google</span>
          </Button>

          <div className="mt-4 text-center text-sm">
            Vous n'avez pas de compte?{" "}
            <Link href="/signup" className="text-destructive hover:underline">
              S'inscrire
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
