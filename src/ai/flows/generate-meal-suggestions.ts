'use server';

/**
 * @fileOverview An AI agent for generating personalized meal suggestions based on dietary requirements and preferences.
 *
 * - generateMealSuggestions - A function that generates meal suggestions.
 * - GenerateMealSuggestionsInput - The input type for the generateMealSuggestions function.
 * - GenerateMealSuggestionsOutput - The return type for the generateMealSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { MealPlan } from '@/lib/types';

const GenerateMealSuggestionsInputSchema = z.object({
  dietaryRequirements: z
    .string()
    .describe('The dietary requirements of the user (e.g., vegetarian, vegan, gluten-free).'),
  preferences: z
    .string()
    .describe('The food preferences of the user (e.g., likes Italian food, dislikes spicy food).'),
  calorieGoal: z.number().describe('The daily calorie goal of the user.'),
  macroRatio: z
    .string()
    .describe(
      'The macronutrient ratio (protein, carbs, fat) that the meal suggestions should adhere to, as a percentage (e.g., 30% protein, 40% carbs, 30% fat)'
    ),
});
export type GenerateMealSuggestionsInput = z.infer<typeof GenerateMealSuggestionsInputSchema>;

const MealSchema = z.object({
    name: z.string().describe("The name of the meal."),
    description: z.string().describe("A brief description of the meal."),
    calories: z.number().describe("Estimated calories for the meal."),
    macros: z.object({
        protein: z.string().describe("Protein content in grams (e.g., '30g')."),
        carbs: z.string().describe("Carbohydrate content in grams (e.g., '50g')."),
        fat: z.string().describe("Fat content in grams (e.g., '20g')."),
    }),
});

const GenerateMealSuggestionsOutputSchema = z.object({
  breakfast: MealSchema.describe("The breakfast suggestion."),
  lunch: MealSchema.describe("The lunch suggestion."),
  dinner: MealSchema.describe("The dinner suggestion."),
});
export type GenerateMealSuggestionsOutput = z.infer<typeof GenerateMealSuggestionsOutputSchema>;


export async function generateMealSuggestions(
  input: GenerateMealSuggestionsInput
): Promise<GenerateMealSuggestionsOutput> {
  return generateMealSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMealSuggestionsPrompt',
  input: {schema: GenerateMealSuggestionsInputSchema},
  output: {schema: GenerateMealSuggestionsOutputSchema},
  prompt: `You are a personal nutritionist that specializes in creating custom meal plans based on dietary requirements and preferences.

  You will generate a list of meal suggestions based on the user's dietary requirements, preferences, calorie goal, and macro ratio. Be as descriptive as possible. Suggest three meals (breakfast, lunch, dinner) and provide the response in a structured JSON format.

  Dietary Requirements: {{{dietaryRequirements}}}
  Preferences: {{{preferences}}}
  Calorie Goal: {{{calorieGoal}}}
  Macro Ratio: {{{macroRatio}}}
  `,
});

const generateMealSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateMealSuggestionsFlow',
    inputSchema: GenerateMealSuggestionsInputSchema,
    outputSchema: GenerateMealSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
