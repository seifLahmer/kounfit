
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
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithRedirect, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { GoogleIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import Image from "next/image";

const MopedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6.5" cy="17.5" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="17.5" r="2.5" fill="currentColor" stroke="none" />
      <path d="M12 18h3.5" strokeWidth="2" />
      <path d="M9 18a6.5 6.5 0 0 0-6.5-6.5V10H6" strokeWidth="2" />
      <path d="M14.5 11.5H19a2 2 0 0 1 2 2v1" strokeWidth="2" />
      <path d="m14.5 5 3 4" strokeWidth="2" />
    </svg>
);

const CatererIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 15h18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1Z" />
        <path d="M8 15V8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v7" />
        <path d="M12 4v3" />
    </svg>
)

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
  
  const RoleButton = ({ role, label, icon: Icon }: {role: string, label: string, icon: React.ElementType}) => (
    <button
        type="button"
        onClick={() => setSelectedRole(role)}
        className={cn(
            "flex flex-col items-center justify-center gap-1 rounded-xl aspect-square w-full transition-all duration-300",
            selectedRole === role
            ? "bg-white text-gray-800 shadow-lg"
            : "bg-white/20 text-white hover:bg-white/30"
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
                    type={isVisible ? 'text' : type}
                    placeholder={placeholder} {...field} 
                    className="pl-12 pr-12 h-14 bg-gray-100 border-gray-200 rounded-xl text-base"
                />
                {isPassword && (
                     <button type="button" onClick={onToggleVisibility} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {isVisible ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5" />}
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
       <div className="relative bg-gradient-to-b from-[#22C58B] to-[#4FD6B3] text-white pb-10" style={{ clipPath: 'ellipse(100% 70% at 50% 30%)' }}>
            <div className="text-center pt-10 px-4 space-y-4">
                <div className="flex items-center justify-between">
                    <Image src="/kounfit.png" alt="Kounfit Logo" width={40} height={40} />
                    <h2 className="text-2xl font-semibold absolute left-1/2 -translate-x-1/2">Inscription - Étape 1/2</h2>
                </div>
                <div className="w-full max-w-sm mx-auto pt-4">
                     <div className="grid grid-cols-3 gap-3">
                        <RoleButton role="client" label="Client" icon={User} />
                        <RoleButton role="caterer" label="Traiteur" icon={CatererIcon} />
                        <RoleButton role="delivery" label="Livreur" icon={MopedIcon} />
                    </div>
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
                    isPassword={true} 
                    isVisible={passwordVisible}
                    onToggleVisibility={() => setPasswordVisible(!passwordVisible)}
                />
                <InputField 
                    name="confirmPassword" 
                    placeholder="Confirmer mot de passe" 
                    icon={Lock} 
                    type="password" 
                    isPassword={true} 
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
                <span className="bg-[#F6F8F7] px-2 text-muted-foreground">
                    Ou s'inscrire avec
                </span>
            </div>
            </div>
            <Button variant="outline" className="w-full h-14 text-base rounded-xl border-gray-300 text-gray-700 bg-white" onClick={handleGoogleSignIn} disabled={isSubmitting}>
             <GoogleIcon className="mr-3 h-6 w-6" /> Google
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
