
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function WelcomePage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background text-white">
      <Image
        src="/welcome.png"
        alt="Healthy food background"
        layout="fill"
        objectFit="cover"
        className="z-0"
        data-ai-hint="healthy food background"
      />
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      <div className="relative z-20 flex flex-col h-full w-full max-w-md p-8">
        <div className="flex-1 flex flex-col justify-center text-center space-y-6">
            <h1 className="text-6xl font-extrabold text-white font-heading">
                Kounfit
            </h1>
            <div className="space-y-2">
                <p className="text-4xl font-bold">
                    Mangez sain,
                </p>
                <p className="text-4xl font-bold">
                    vivez mieux
                </p>
            </div>
            <p className="text-lg text-white/90">
                Votre partenaire nutrition personnalisé pour des repas sains livrés chez vous.
            </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild size="lg" className="w-full h-14 text-lg font-semibold rounded-button bg-primary hover:bg-primary/90">
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button asChild size="lg" className="w-full h-14 text-lg font-semibold rounded-button bg-secondary hover:bg-secondary/90">
            <Link href="/signup">S'inscrire</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
