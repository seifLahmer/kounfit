
import MealDetailClient from './meal-detail-client';
import { getMealById } from '@/lib/services/mealService';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default async function MealDetailPage({ params }: { params: { id: string } }) {
  const meal = await getMealById(params.id);

  if (!meal) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <p className="text-lg text-muted-foreground mb-4">Désolé, ce repas est introuvable.</p>
        <Button onClick={() => (window.location.href = '/home')}>Retour à l'accueil</Button>
      </div>
    );
  }

  return <MealDetailClient meal={meal} />;
}
