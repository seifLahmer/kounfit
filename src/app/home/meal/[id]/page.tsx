
import MealDetailClient from './meal-detail-client';

export default function MealDetailPage({ params }: { params: { id: string } }) {
  // Nous passons le mealId au composant client, qui se chargera de la récupération des données.
  return <MealDetailClient mealId={params.id} />;
}
