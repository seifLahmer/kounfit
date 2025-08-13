
import AddMealClientPage from './add-meal-client';

export async function generateStaticParams() {
  return [
    { mealType: 'breakfast' },
    { mealType: 'lunch' },
    { mealType: 'dinner' },
    { mealType: 'snack' },
  ];
}

export default function AddMealPage() {
  return <AddMealClientPage />;
}
