
import { NextRequest, NextResponse } from 'next/server';
import { analyzeMeal } from '@/ai/flows/meal-analysis-flow';

export async function POST(req: NextRequest) {
  try {
    const { mealName } = await req.json();

    if (!mealName) {
      return NextResponse.json({ error: 'mealName is required' }, { status: 400 });
    }

    const analysis = await analyzeMeal({ mealName });

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Error in analyze-meal route:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
