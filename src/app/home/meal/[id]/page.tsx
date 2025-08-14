import MealDetailClient from './meal-detail-client';

export async function generateStaticParams() {
  // Retourne un tableau vide pour indiquer à Next.js de ne générer aucune page
  // statique pour les repas au moment du build.
  // Les pages seront rendues côté client.
  return [];
}

export default function MealDetailPage({ params }: { params: { id: string } }) {
  return <MealDetailClient params={params} />;
}
