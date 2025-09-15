
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LeafPattern } from "@/components/icons";
import { Check } from "lucide-react";
import Image from "next/image";

export default function PendingApprovalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#EBFBF5] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <LeafPattern className="absolute inset-0 w-full h-full text-primary/10" />
      <div className="relative w-full max-w-md bg-card shadow-xl rounded-3xl mx-4">
        <div className="bg-gradient-to-b from-[#22C58B] to-[#0B7E58] rounded-t-3xl text-white text-center p-8">
            <Image src="/kounfit/kounfit white.png" alt="Kounfit Logo" width={120} height={30} className="mx-auto" />
        </div>

        <div className="relative bg-card rounded-b-3xl px-6 pb-8 text-center -mt-8 pt-12">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
                 <div className="bg-[#22C58B] text-white rounded-full w-14 h-14 flex items-center justify-center">
                    <Check size={36} strokeWidth={3} />
                </div>
            </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Inscription terminée
          </h2>
          <p className="text-muted-foreground mb-4">
            Un email a été envoyé pour vérifier votre adresse e-mail.
          </p>
          <p className="text-muted-foreground mb-4">
            Votre demande d'inscription a été enregistrée avec succès. Un
            administrateur va examiner votre profil et vous recevrez un email de
            confirmation dès que votre compte sera activé.
          </p>
          <p className="text-muted-foreground font-semibold mb-6">
            Délai d’approbation estimé: 24–48 heures
          </p>
          
          <Button
            onClick={() => router.push("/welcome")}
            className="w-full h-14 text-lg font-semibold rounded-full bg-secondary hover:bg-secondary/90 text-white"
          >
            Retour à l’accueil
          </Button>

           <p className="mt-6 text-sm text-gray-400">
             Pour toute question, contactez <a href="mailto:support@kounfit.com" className="font-semibold text-primary underline">support@kounfit.com</a>
           </p>
        </div>
      </div>
    </div>
  );
}
