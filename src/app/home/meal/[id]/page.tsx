import MealDetailClient from './meal-detail-client';
import { getAllMealIds } from '@/lib/services/mealService';

export async function generateStaticParams() {
  const mealIds = await getAllMealIds();
  return mealIds.map((meal) => ({
    id: meal.id,
  }));
}

export default function MealDetailPage({ params }: { params: { id: string } }) {
  return <MealDetailClient params={params} />;
}
