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
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { auth, googleProvider, facebookProvider, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Lock, Eye, EyeOff, ChefHat, Bike } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
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

  const handleGoogleSignup = async () => { /* Logic for Google Signup */ };
  const handleFacebookSignup = async () => { /* Logic for Facebook Signup */ };

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
                className={cn("pl-12 pr-12 h-14 bg-gray-100 border-gray-200 rounded-xl text-base")}
              />
              {isPassword && (
                <button type="button" onClick={onToggleVisibility} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      <motion.div
        className="relative bg-gradient-to-b from-[#22C58B] to-[#4FD6B3] text-white rounded-b-[3rem] md:rounded-b-[4rem] flex flex-col justify-center"
        initial={false}
        animate={{ height: selectedRole ? 'auto' : '60vh' }}
        transition={{ duration: 0.6, ease: [0.83, 0, 0.17, 1] }}
      >
        <div className="w-full max-w-md mx-auto px-4 py-6">
            <div className="flex items-center justify-center relative h-10 mb-4">
                <Image src="/k/k white.png" alt="Kounfit Logo" width={40} height={40} className="absolute left-0" />
                <h2 className="text-2xl font-semibold">Inscription</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <RoleButton role="client" label="Client" icon={User} />
                <RoleButton role="caterer" label="Traiteur" icon={ChefHat} />
                <RoleButton role="delivery" label="Livreur" icon={Bike} />
            </div>
        </div>
      </motion.div>

      <div className="flex-1 w-full max-w-md mx-auto px-4 overflow-y-auto">
        {selectedRole && (
          <motion.div
            key={selectedRole}
            className="pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
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
              <Button variant="outline" className="w-full h-14 text-base rounded-xl border-gray-300 text-gray-700 bg-white shadow-sm" onClick={handleGoogleSignup} disabled={isSubmitting}>
                <GoogleIcon className="mr-3 h-6 w-6" /> Google
              </Button>
              <Button variant="outline" className="w-full h-14 text-base rounded-xl border-gray-300 text-gray-700 bg-white shadow-sm" onClick={handleFacebookSignup} disabled={isSubmitting}>
                <FacebookIcon className="mr-3 h-6 w-6" /> Facebook
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <p className="py-6 text-center text-sm text-muted-foreground">
        Déjà un compte?{" "}
        <Link href="/login" className="font-semibold text-[#0B7E58]">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
