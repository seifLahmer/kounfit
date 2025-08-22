
import MealDetailClient from './meal-detail-client';

export default function MealDetailPage({ params }: { params: { id: string } }) {
  return <MealDetailClient params={params} />;
}
