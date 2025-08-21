
'use server';

/**
 * @fileOverview An AI flow to analyze a meal from its name, 
 * estimating ingredients and calculating nutritional information.
 *
 * - analyzeMeal - A function that handles the meal analysis process.
 * - MealAnalysisInput - The input type for the analyzeMeal function.
 * - MealAnalysis - The return type for the analyzeMeal function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MealAnalysisInputSchema = z.object({
  mealName: z.string().describe('The name of the meal to analyze. e.g., "Couscous au poulet"'),
});
export type MealAnalysisInput = z.infer<typeof MealAnalysisInputSchema>;

const IngredientSchema = z.object({
    name: z.string().describe("The name of the ingredient, e.g., 'Semoule de blé dur'"),
    grams: z.number().describe("The estimated weight of the ingredient in grams, e.g., 150"),
});

const TotalMacrosSchema = z.object({
    calories: z.number().describe("Total calories in kcal for the entire dish."),
    protein: z.number().describe("Total protein in grams for the entire dish."),
    carbs: z.number().describe("Total carbohydrates in grams for the entire dish."),
    fat: z.number().describe("Total fat in grams for the entire dish."),
    fibers: z.number().optional().describe("Total fibers in grams for the entire dish, if available."),
});

const MealAnalysisSchema = z.object({
  mealName: z.string().describe("The original name of the meal provided."),
  description: z.string().describe("A short, appealing marketing description for the meal."),
  ingredients: z.array(IngredientSchema).describe("An array of estimated ingredients for the meal."),
  totalMacros: TotalMacrosSchema.describe("The calculated total nutritional information for the entire meal."),
});
export type MealAnalysis = z.infer<typeof MealAnalysisSchema>;


export async function analyzeMeal(input: MealAnalysisInput): Promise<MealAnalysis> {
  return mealAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mealAnalysisPrompt',
  input: {schema: MealAnalysisInputSchema},
  output: {schema: MealAnalysisSchema},
  prompt: `
    You are an expert nutritionist and chef for a meal delivery service.
    Your task is to analyze a meal based on its name to estimate its ingredients and calculate its nutritional profile.

    The user will provide a meal name: {{{mealName}}}.

    Follow these steps:
    1.  **Estimate Ingredients**: Based on the meal name, create a realistic list of common ingredients and their estimated quantities in grams for a single serving.
    2.  **Calculate Nutrition**: For each ingredient, estimate its nutritional values (calories, protein, carbs, fat, fibers). Then, sum them up to get the total nutritional profile for the entire dish.
    3.  **Generate Description**: Write a short, appealing marketing description for the meal, highlighting its key features (e.g., "healthy", "protein-rich", "delicious").
    4.  **Format Output**: Return the data in the specified JSON format.

    Example for "Couscous au poulet":
    - Ingredients: Semoule (150g), Poulet (120g), Pois chiches (50g), Carottes (60g), Courgettes (60g), Huile d’olive (10g).
    - Calculated Totals: Calories: ~720 kcal, Protéines: ~38g, Glucides: ~82g, Lipides: ~28g, Fibres: ~10g.
    - Description: "A traditional and hearty couscous with tender chicken and fresh vegetables, perfectly spiced for a flavorful and balanced meal."

    Now, analyze the following meal: {{{mealName}}}
  `,
});

const mealAnalysisFlow = ai.defineFlow(
  {
    name: 'mealAnalysisFlow',
    inputSchema: MealAnalysisInputSchema,
    outputSchema: MealAnalysisSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid analysis.");
    }
    return output;
  }
);
