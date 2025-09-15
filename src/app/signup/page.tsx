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
  fetchSignInMethodsForEmail,
  FacebookAuthProvider,
  AuthError,
  sendEmailVerification,
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Lock, Eye, EyeOff, ChefHat, Bike } from "lucide-react";
import { getUserRole } from "@/lib/services/roleService";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { GoogleIcon, FacebookIcon } from "@/components/icons";
import { motion } from "framer-motion";

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Le nom complet doit comporter au moins 2 caractères."),
    email: z.string().email("Veuillez saisir une adresse e-mail valide."),
    password: z.string().min(6, "Le mot de passe doit comporter au moins 6 caractères."),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
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
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

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

  const handlePostSignup = useCallback(
    async (user: any) => {
      try {
        const role = await getUserRole(user.uid);

        if (role === "caterer" || role === "delivery") {
          const collectionName = role === "caterer" ? "caterers" : "deliveryPeople";
          const docRef = doc(db, collectionName, user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const status = docSnap.data().status;
            if (status === "pending") {
              router.replace("/signup/pending-approval");
              return;
            }
            if (status === "rejected") {
              await auth.signOut();
              toast({ title: "Accès refusé", description: "Votre compte a été rejeté.", variant: "destructive" });
              setIsSubmitting(false);
              return;
            }
          }
        }

        // Redirection selon rôle
        switch (role) {
          case "caterer":
            router.replace("/signup/caterer/step2");
            break;
          case "delivery":
            router.replace("/signup/delivery/step2");
            break;
          case "client":
              router.replace("/home");
            break;
          default:
            router.replace("/signup/step2");
            break;
        }
      } catch (error) {
        console.error("Erreur après signup :", error);
        toast({ title: "Erreur", description: "Impossible de vérifier le rôle ou le statut.", variant: "destructive" });
        setIsSubmitting(false);
      }
    },
    [router, toast]
  );

  // Signup email/password
  const onSubmit = async (data: SignupFormValues) => {
    if (!selectedRole) {
      toast({
        title: "Veuillez choisir un rôle",
        description: "Sélectionnez si vous êtes un client, un traiteur ou un livreur.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.fullName });

      let status = "active";
      let collectionName = "users";

      if (selectedRole === "caterer") {
        collectionName = "caterers";
        status = "pending";
      } else if (selectedRole === "delivery") {
        collectionName = "deliveryPeople";
        status = "pending";
      }

      await setDoc(doc(db, collectionName, userCredential.user.uid), {
        name: data.fullName,
        email: data.email,
        role: selectedRole,
        status,
        createdAt: new Date(),
      });

      switch (selectedRole) {
        case 'client':
          await sendEmailVerification(userCredential.user);
          toast({
            title: "E-mail de validation envoyé",
            description: "Veuillez consulter votre boîte de réception pour valider votre compte.",
          });
          router.replace("/signup/pending-verification");
          break;
        case 'caterer':
          router.replace("/signup/caterer/step2");
          break;
        case 'delivery':
          router.replace("/signup/delivery/step2");
          break;
        default:
          router.replace("/login");
          break;
      }

    } catch (error: any) {
      console.error("Signup Error:", error);
      let description = "Une erreur s'est produite lors de l'inscription.";
      if (error.code === "auth/email-already-in-use") {
        description = "Cette adresse e-mail est déjà utilisée. Veuillez vous connecter.";
      }
      toast({ title: "Erreur d'inscription", description, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Signup Google
  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) await handlePostSignup(result.user);
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

  // Signup Facebook
  const handleFacebookSignup = async () => {
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, facebookProvider);

      if (result.user) {
        if (!result.user.displayName) {
          await updateProfile(result.user, { displayName: "Utilisateur Facebook" });
        }
        await handlePostSignup(result.user);
      }
    } catch (error: any) {
      console.error("Facebook Signup Error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        setIsSubmitting(false);
        return;
      }

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
    <div className="min-h-screen bg-[#F6F8F7] flex flex-col items-center pt-10 px-4">
      <div className="relative bg-gradient-to-b from-[#22C58B] to-[#4FD6B3] text-white pb-10 w-full max-w-md" style={{ clipPath: "ellipse(120% 70% at 50% 30%)" }}>
        <div className="text-center pt-6 px-4 space-y-4">
          <div className="flex items-center justify-center relative h-10">
            <Image src="/k/k white.png" alt="Kounfit Logo" width={40} height={40} className="absolute left-0" />
            <h2 className="text-2xl font-semibold">Inscription - Étape 1/2</h2>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 px-4">
          <RoleButton role="client" label="Client" icon={User} />
          <RoleButton role="caterer" label="Traiteur" icon={ChefHat} />
          <RoleButton role="delivery" label="Livreur" icon={Bike} />
        </div>
      </div>

      <div className="w-full max-w-md flex-1">
        {selectedRole && (
          <motion.div 
            className="-mt-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "circOut" }}
          >
            <div className="bg-white p-6 rounded-2xl shadow-lg">
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
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">OU S'INSCRIRE AVEC</span>
                </div>
                </div>

                <div className="space-y-3">
                    <Button variant="outline" className="w-full h-14 text-base rounded-xl border-gray-300 text-gray-700 bg-white" onClick={handleGoogleSignup} disabled={isSubmitting}>
                        <GoogleIcon className="mr-3 h-6 w-6" /> Google
                    </Button>

                    <Button variant="outline" className="w-full h-14 text-base rounded-xl border-gray-300 text-gray-700 bg-white" onClick={handleFacebookSignup} disabled={isSubmitting}>
                        <FacebookIcon className="mr-3 h-6 w-6" /> Facebook
                    </Button>
                </div>
            </div>
          </motion.div>
        )}
      </div>

       <p className="py-8 text-center text-sm text-muted-foreground">
          Déjà un compte?{" "}
          <Link href="/login" className="font-semibold text-[#0B7E58]">
            Se connecter
          </Link>
        </p>
    </div>
  );
}
