'use server';

import { getMealById } from '@/lib/services/mealService';
import type { Meal } from '@/lib/types';

export async function getMealDetails(mealId: string): Promise<Meal | null> {
  try {
    const meal = await getMealById(mealId);
    if (!meal) {
      return null;
    }
    // We need to serialize the date objects for the client component
    return {
        ...meal,
        createdAt: meal.createdAt ? meal.createdAt.toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching meal details for ${mealId}:`, error);
    return null;
  }
}
