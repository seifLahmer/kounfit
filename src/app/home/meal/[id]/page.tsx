import MealDetailClient from './meal-detail-client';

export default function MealDetailPage({ params }: { params: { id: string } }) {
  // We pass the mealId to the client component, which will handle fetching.
  return <MealDetailClient mealId={params.id} />;
}
