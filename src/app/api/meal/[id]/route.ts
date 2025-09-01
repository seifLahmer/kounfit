
import { NextRequest, NextResponse } from 'next/server';
import { getMealById } from '@/lib/services/mealService';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!id) {
      return NextResponse.json({ error: 'Meal ID is required' }, { status: 400 });
    }

    const meal = await getMealById(id);

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    return NextResponse.json(meal);
  } catch (error: any) {
    console.error(`Error fetching meal ${context.params.id}:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
