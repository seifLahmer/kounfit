
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
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { getUserRole } from "@/lib/services/roleService";
import { updateUserProfile, getUserProfile } from "@/lib/services/userService";
import { AuthRedirectHandler } from "@/components/auth-redirect-handler";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="24px"
    height="24px"
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.657-3.356-11.303-7.962l-6.571,4.819C9.656,39.663,16.318,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.901,36.636,44,31.25,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const redirectUser = async (uid: string) => {
    // Check if user has completed step 2
    const userProfile = await getUserProfile(uid);
    if (userProfile && !userProfile.mainGoal) {
       router.push('/signup/step2');
       return;
    }
    
    const role = await getUserRole(uid);
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'caterer') {
      router.push('/caterer');
    } else {
      router.push('/home');
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    // Use signInWithRedirect instead of signInWithPopup
    await signInWithRedirect(auth, provider);
  }


  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      await redirectUser(user.uid);

    } catch (error: any) {
      let description = "An error occurred during login.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "Email ou mot de passe invalide. Veuillez réessayer.";
      }
      toast({
        title: "Échec de la connexion",
        description: description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <AuthRedirectHandler setGoogleLoading={setGoogleLoading} />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
           <Link href="/welcome" className="flex justify-center items-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-destructive" />
            <span className="text-2xl font-bold">NutriTrack</span>
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
                      <Link href="#" className="text-sm text-muted-foreground hover:underline">
                        Mot de passe oublié?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={loading || googleLoading}>
                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </Form>

           <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                OU CONTINUER AVEC
                </span>
            </div>
          </div>
           <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading || googleLoading}>
             {googleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             ) : (
                <GoogleIcon className="mr-2 h-5 w-5" />
             )}
            Google
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
