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

const GenerateMealSuggestionsOutputSchema = z.object({
  mealSuggestions: z
    .string()
    .describe(
      'A list of meal suggestions that match the dietary requirements, preferences, calorie goal, and macro ratio of the user.'
    ),
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

  You will generate a list of meal suggestions based on the user's dietary requirements, preferences, calorie goal, and macro ratio. Be as descriptive as possible. Suggest three meals (breakfast, lunch, dinner) as JSON format.

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

