
'use server';
/**
 * @fileOverview A Genkit tool to fetch nutritional data from the USDA FoodData Central API.
 * 
 * - getIngredientNutrition - The tool function to get nutrition for a single ingredient.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NutritionInputSchema = z.object({
  ingredientName: z.string().describe('The name of the ingredient to look up.'),
  grams: z.number().describe('The weight of the ingredient in grams.'),
});

const NutritionOutputSchema = z.object({
  calories: z.number().describe('Calculated calories for the given weight.'),
  protein: z.number().describe('Calculated protein in grams.'),
  carbs: z.number().describe('Calculated carbohydrates in grams.'),
  fat: z.number().describe('Calculated fat in grams.'),
});

export const getIngredientNutrition = ai.defineTool(
  {
    name: 'getIngredientNutrition',
    description: 'Fetches detailed nutritional information for a specific quantity of an ingredient from the USDA FoodData Central database.',
    inputSchema: NutritionInputSchema,
    outputSchema: NutritionOutputSchema,
  },
  async ({ ingredientName, grams }) => {
    const API_KEY = process.env.FOOD_DATA_API_KEY;
    if (!API_KEY) {
      throw new Error("FOOD_DATA_API_KEY is not configured.");
    }
    
    // 1. Search for the food item to get its FDC ID
    const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(ingredientName)}&api_key=${API_KEY}&dataType=Foundation,SR%20Legacy`;
    
    let fdcId: number | null = null;
    try {
      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) {
        throw new Error(`Failed to search for food: ${searchResponse.statusText}`);
      }
      const searchData = await searchResponse.json();
      if (searchData.foods && searchData.foods.length > 0) {
        fdcId = searchData.foods[0].fdcId;
      } else {
        throw new Error(`No results found for ingredient: ${ingredientName}`);
      }
    } catch (error) {
       console.error("USDA API Search Error:", error);
       // Return zeroed data if search fails to not break the whole flow
       return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    // 2. Fetch detailed nutritional data using the FDC ID
    const detailsUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${API_KEY}`;
    try {
      const detailsResponse = await fetch(detailsUrl);
      if (!detailsResponse.ok) {
        throw new Error(`Failed to fetch food details: ${detailsResponse.statusText}`);
      }
      const detailsData = await detailsResponse.json();
      
      const nutrients = detailsData.foodNutrients;
      const getNutrientValue = (nutrientNumber: number): number => {
        const nutrient = nutrients.find((n: any) => n.nutrient.number === String(nutrientNumber));
        return nutrient ? nutrient.amount : 0; // per 100g
      };

      const caloriesPer100g = getNutrientValue(208);
      const proteinPer100g = getNutrientValue(203);
      const carbsPer100g = getNutrientValue(205);
      const fatPer100g = getNutrientValue(204);

      // 3. Calculate nutrients for the specified gram amount
      const multiplier = grams / 100;
      return {
        calories: Math.round(caloriesPer100g * multiplier),
        protein: Math.round(proteinPer100g * multiplier),
        carbs: Math.round(carbsPer100g * multiplier),
        fat: Math.round(fatPer100g * multiplier),
      };

    } catch (error) {
      console.error("USDA API Details Error:", error);
      // Return zeroed data if details fetch fails
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
  }
);
