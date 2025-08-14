
import { NextRequest, NextResponse } from 'next/server';
import { analyzeMeal, MealAnalysisInput } from '@/ai/flows/meal-analysis-flow';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { mealName } = (await req.json()) as MealAnalysisInput;

    if (!mealName) {
      return NextResponse.json({ error: 'mealName is required' }, { status: 400 });
    }

    const analysis = await analyzeMeal({ mealName });

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Error in analyze-meal API:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
