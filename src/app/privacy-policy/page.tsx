
import Link from 'next/link';
import { Leaf, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background z-10 border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/welcome">
            <ChevronLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Politique de Confidentialité</h1>
      </header>
      <main className="flex-1 p-6 space-y-6 max-w-4xl mx-auto">
        <div className="text-center">
          <Leaf className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold">Politique de Confidentialité de NutriTrack</h2>
          <p className="text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div className="space-y-4 text-muted-foreground">
          <p>
            Bienvenue sur NutriTrack. Nous respectons votre vie privée et nous nous engageons à la protéger. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles.
          </p>

          <h3 className="text-xl font-semibold text-foreground pt-4">1. Collecte des informations</h3>
          <p>
            Nous collectons les informations que vous nous fournissez directement lors de votre inscription, telles que votre nom, votre adresse e-mail, ainsi que les données que vous saisissez pour personnaliser votre expérience (âge, poids, taille, objectifs). Si vous vous connectez via un service tiers comme Facebook, nous recevons les informations de base de votre profil public conformément à leurs politiques.
          </p>

          <h3 className="text-xl font-semibold text-foreground pt-4">2. Utilisation des informations</h3>
          <p>
            Vos informations sont utilisées pour :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fournir et personnaliser nos services, comme le calcul de vos besoins caloriques.</li>
            <li>Gérer votre compte et vous envoyer des notifications relatives à vos commandes.</li>
            <li>Améliorer la sécurité et le fonctionnement de notre application.</li>
            <li>Communiquer avec vous concernant votre compte ou nos services.</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground pt-4">3. Partage des informations</h3>
          <p>
            Nous ne partageons pas vos informations personnelles avec des tiers, sauf dans les cas suivants :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Avec votre consentement explicite.</li>
            <li>Pour nous conformer à une obligation légale.</li>
            <li>Pour protéger nos droits, notre vie privée, notre sécurité ou nos biens.</li>
          </ul>
          <p>
             Lorsque vous passez une commande, nous partageons les informations nécessaires (comme votre nom et votre adresse) avec le traiteur concerné pour assurer la livraison.
          </p>

          <h3 className="text-xl font-semibold text-foreground pt-4">4. Sécurité des données</h3>
          <p>
            Nous utilisons des mesures de sécurité techniques et organisationnelles pour protéger vos données contre l'accès non autorisé, la modification, la divulgation ou la destruction.
          </p>

          <h3 className="text-xl font-semibold text-foreground pt-4">5. Vos droits et suppression des données</h3>
          <p>
            Vous pouvez à tout moment accéder et modifier les informations de votre profil directement dans l'application depuis la page "Profil". Vous avez également le droit de supprimer votre compte et toutes les données associées.
          </p>
           <p>
            Pour supprimer définitivement votre compte, vous pouvez vous rendre sur votre page de profil dans l'application et utiliser l'option de suppression de compte. La suppression de votre compte est une action irréversible et entraînera la suppression de toutes vos données personnelles de nos systèmes. Alternativement, vous pouvez envoyer une demande de suppression de données à l'adresse e-mail ci-dessous.
          </p>

          <h3 className="text-xl font-semibold text-foreground pt-4">6. Contact</h3>
          <p>
            Pour toute question concernant cette politique de confidentialité ou pour une demande de suppression de données, veuillez nous contacter à l'adresse contact@nutritrack.app.
          </p>
        </div>
      </main>
    </div>
  );
}
