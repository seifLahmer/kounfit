
type Gender = "male" | "female";
type ActivityLevel = "sedentary" | "lightly_active" | "moderately_active" | "very_active";
type Goal = "lose_weight" | "maintain" | "gain_muscle";

interface NutritionalNeedsInput {
    gender: Gender;
    age: number;
    weight: number; // in kg
    height: number; // in cm
    activityLevel: ActivityLevel;
    goal: Goal;
}

interface NutritionalNeedsOutput {
    calories: number;
    macros: {
        protein: number; // in grams
        carbs: number;   // in grams
        fat: number;     // in grams
    };
}

const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
};

const goalAdjustments: Record<Goal, number> = {
    lose_weight: -500, // Calorie deficit for fat loss
    maintain: 0,
    gain_muscle: 500,  // Calorie surplus for muscle gain
};

// Recommended macros ratios based on goal
const macroRatios: Record<Goal, { protein: number; carbs: number; fat: number }> = {
    lose_weight: { protein: 0.4, carbs: 0.4, fat: 0.2 }, // Higher protein for satiety
    maintain: { protein: 0.3, carbs: 0.5, fat: 0.2 },
    gain_muscle: { protein: 0.3, carbs: 0.5, fat: 0.2 }, // Higher carbs for energy
};


/**
 * Calculates daily nutritional needs based on user data and goals.
 * Uses the Mifflin-St Jeor equation for BMR calculation.
 * @param {NutritionalNeedsInput} input - The user's data.
 * @returns {NutritionalNeedsOutput} - The calculated daily calories and macros.
 */
export function calculateNutritionalNeeds(input: NutritionalNeedsInput): NutritionalNeedsOutput {
    const { gender, age, weight, height, activityLevel, goal } = input;

    // 1. Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor
    let bmr: number;
    if (gender === "male") {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else { // female
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // 2. Adjust BMR for activity level to get Total Daily Energy Expenditure (TDEE)
    const tdee = bmr * activityMultipliers[activityLevel];

    // 3. Adjust TDEE based on the user's primary goal
    const finalCalories = Math.round(tdee + goalAdjustments[goal]);

    // 4. Calculate macronutrients based on the final calorie count and goal-specific ratios
    const ratios = macroRatios[goal];
    const proteinGrams = Math.round((finalCalories * ratios.protein) / 4); // 4 calories per gram of protein
    const carbsGrams = Math.round((finalCalories * ratios.carbs) / 4);     // 4 calories per gram of carbs
    const fatGrams = Math.round((finalCalories * ratios.fat) / 9);         // 9 calories per gram of fat

    return {
        calories: finalCalories,
        macros: {
            protein: proteinGrams,
            carbs: carbsGrams,
            fat: fatGrams,
        },
    };
}
