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
} from "@/components/ui/form";
import { useState, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  AuthError
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { getUserRole } from "@/lib/services/roleService";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { GoogleIcon , FacebookIcon } from "@/components/icons";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { FacebookAuthProvider } from "firebase/auth";

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
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState("client");
  const facebookProvider = new FacebookAuthProvider();
  facebookProvider.addScope("email");

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Fonction pour redirection et validation après signup
  const handlePostSignup = useCallback(async (user: any) => {
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
            toast({ title: "Accès refusé", description: "Votre compte a été rejeté.", variant: "destructive" });
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Redirection selon rôle
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
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().mainGoal) {
            router.replace('/home');
          } else {
            router.replace('/signup/step2');
          }
          break;
        default:
          router.replace('/signup/step2');
          break;
      }
    } catch (error) {
      console.error("Erreur après signup :", error);
      toast({ title: "Erreur", description: "Impossible de vérifier le rôle ou le statut.", variant: "destructive" });
      setIsSubmitting(false);
    }
  }, [router, toast]);

  // Signup avec email et mot de passe
  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    try {

      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);

      await updateProfile(userCredential.user, { displayName: data.fullName });
      let status = "active"; // par défaut client est actif
      let collectionName = "users";

      if (selectedRole === "caterer") {
        collectionName = "caterers";
        status = "pending"; // en attente de validation admin
      } else if (selectedRole === "delivery") {
        collectionName = "deliveryPeople";
        status = "pending"; // en attente de validation admin
      }

      // 📌 Créer le document dans la bonne collection
      await setDoc(doc(db, collectionName, userCredential.user.uid), {
        name: data.fullName,
        email: data.email,
        role: selectedRole,
        status,
        createdAt: new Date(),
      });
      await handlePostSignup(userCredential.user);

    } catch (error: any) {
      console.error("Signup Error:", error);
      let description = "Une erreur s'est produite lors de l'inscription.";
      if (error.code === 'auth/email-already-in-use') {
        description = "Cette adresse e-mail est déjà utilisée. Veuillez essayer de vous connecter.";
      }
      toast({ title: "Erreur d'inscription", description, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Signup avec Google (popup)
  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await handlePostSignup(result.user);
      }
    } catch (error: any) {
      console.error("Google Signup Error:", error);
      toast({
        title: "Erreur Google",
        description: (error as AuthError).message || "Impossible de se connecter avec Google.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleFacebookSignup = async () => {
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      if (result.user) {
        // Met à jour le nom si disponible
        if (result.user.displayName) {
          await updateProfile(result.user, { displayName: result.user.displayName });
        }
        await handlePostSignup(result.user);
      }
    } catch (error: any) {
      console.error(error)
      console.error("Facebook Signup Error:", error);
      toast({
        title: "Erreur Facebook",
        description: error.message || "Impossible de se connecter avec Facebook.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const RoleButton = ({ role, label, icon: Icon }: { role: string; label: string; icon: React.ElementType }) => (
    <button
      type="button"
      onClick={() => setSelectedRole(role)}
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-xl aspect-square w-full transition-all duration-300",
        selectedRole === role ? "bg-white text-gray-800 shadow-lg" : "bg-white/20 text-white hover:bg-white/30"
      )}
    >
      <Icon className="w-7 h-7" />
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );

  const InputField = ({ name, placeholder, icon: Icon, type = "text", isPassword = false, onToggleVisibility, isVisible = false }: any) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className="relative">
              <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type={isVisible ? "text" : type}
                placeholder={placeholder}
                {...field}
                className="pl-12 pr-12 h-14 bg-white border-gray-200 rounded-xl text-base"
              />
              {isPassword && (
                <button type="button" onClick={onToggleVisibility} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              )}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );

  return (
    <div className="min-h-screen bg-[#F6F8F7] flex flex-col">

      <div className="relative bg-gradient-to-b from-[#22C58B] to-[#4FD6B3] text-white pb-10" style={{ clipPath: "ellipse(100% 70% at 50% 30%)" }}>
        <div className="text-center pt-10 px-4 space-y-4">
          <div className="flex items-center justify-between">
            <Image src="/k/k white.png" alt="Kounfit Logo" width={40} height={40} />
            <h2 className="text-2xl font-semibold absolute left-1/2 -translate-x-1/2">Inscription - Étape 1/2</h2>
          </div>
        </div>
        <div className="mt-6">
          <div className="grid grid-cols-3 gap-3">
            <RoleButton role="client" label="Client" icon={User} />
            <RoleButton role="caterer" label="Caterer" icon={User} />
            <RoleButton role="delivery" label="Delivery" icon={User} />
          </div>
        </div>

      </div>

      <div className="w-full max-w-md mx-auto px-4 flex-1 -mt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputField name="fullName" placeholder="Nom complet" icon={User} />
            <InputField name="email" placeholder="Email" icon={Mail} />
            <InputField
              name="password"
              placeholder="Mot de passe"
              icon={Lock}
              type="password"
              isPassword
              isVisible={passwordVisible}
              onToggleVisibility={() => setPasswordVisible(!passwordVisible)}
            />
            <InputField
              name="confirmPassword"
              placeholder="Confirmer mot de passe"
              icon={Lock}
              type="password"
              isPassword
              isVisible={confirmPasswordVisible}
              onToggleVisibility={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            />

            <Button type="submit" className="w-full h-14 text-lg font-semibold rounded-xl bg-[#0B7E58] hover:bg-[#0a6e4d]" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Continuer
            </Button>
          </form>
        </Form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#F6F8F7] px-2 text-muted-foreground">Ou s'inscrire avec</span>
          </div>
        </div>

        <Button variant="outline" className="w-full h-14 text-base rounded-xl border-gray-300 text-gray-700 bg-white" onClick={handleGoogleSignup} disabled={isSubmitting}>
          <GoogleIcon className="mr-3 h-6 w-6" /> Google
        </Button>
        <Button
          variant="outline"
          className="w-full h-14 text-base rounded-xl border-gray-300 text-gray-700 bg-white mt-3"
          onClick={handleFacebookSignup}
          disabled={isSubmitting}
        >
          <FacebookIcon className="mr-3 h-6 w-6" />
          Facebook
        </Button>


        <p className="mt-8 text-center text-sm text-muted-foreground">
          Déjà un compte?{" "}
          <Link href="/login" className="font-semibold text-[#0B7E58]">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
