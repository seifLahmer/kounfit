import { NextResponse } from 'next/server';
import { analyzeMeal } from '@/ai/flows/meal-analysis-flow';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mealName } = body;

    if (!mealName) {
      return NextResponse.json({ error: 'mealName is required' }, { status: 400 });
    }

    const analysisResult = await analyzeMeal({ mealName });

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('[MEAL_ANALYSIS_API] Error:', error);
    // Determine if the error is from the AI model or a generic server error
    const errorMessage = (error instanceof Error && error.message.includes('model'))
      ? "The AI model failed to return a valid analysis."
      : "An unexpected error occurred.";
      
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
