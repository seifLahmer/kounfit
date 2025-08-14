import MealDetailClient from './meal-detail-client';

// This function tells Next.js not to pre-render any specific meal pages at build time.
// They will be rendered on the client-side when a user navigates to them.
// This is necessary for `output: 'export'` to work with dynamic routes.
export async function generateStaticParams() {
  return [];
}

export default function MealDetailPage({ params }: { params: { mealId: string } }) {
  // The page itself is a Server Component.
  // It passes the params to the Client Component which handles all the logic.
  return <MealDetailClient mealId={params.mealId} />;
}
