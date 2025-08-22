
import Image from "next/image";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Meal } from "@/lib/types";

const CalorieCircle = ({
  consumed,
  goal,
}: {
  consumed: number;
  goal: number;
}) => {
  const percentage = goal > 0 ? (consumed / goal) * 100 : 0;
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="stroke-current text-gray-200"
          strokeWidth="10"
          fill="none"
          cx="50"
          cy="50"
          r="40"
        />
        <circle
          className="stroke-current text-primary"
          strokeWidth="10"
          fill="none"
          cx="50"
          cy="50"
          r="40"
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: "stroke-dashoffset 0.5s",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{consumed}</span>
        <span className="text-xs text-muted-foreground">Kcal</span>
      </div>
    </div>
  );
};

const MacroBar = ({
  label,
  consumed,
  goal,
  colorClass,
}: {
  label: string;
  consumed: number;
  goal: number;
  colorClass: string;
}) => {
  const percentage = goal > 0 ? (consumed / goal) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-semibold">{label}</span>
        <span>
          {Math.round(consumed)}/{goal}g
        </span>
      </div>
      <Progress value={percentage} indicatorClassName={colorClass} />
    </div>
  );
};

export const NutritionSummary = ({
  consumedCalories,
  calorieGoal,
  consumedMacros,
  macroGoals,
}: {
  consumedCalories: number;
  calorieGoal: number;
  consumedMacros: { protein: number; carbs: number; fat: number };
  macroGoals: { protein: number; carbs: number; fat: number };
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-shrink-0">
        <CalorieCircle consumed={consumedCalories} goal={calorieGoal} />
      </div>
      <div className="flex-1 space-y-3">
        <MacroBar
          label="Protéines"
          consumed={consumedMacros.protein}
          goal={macroGoals.protein}
          colorClass="bg-protein"
        />
        <MacroBar
          label="Glucides"
          consumed={consumedMacros.carbs}
          goal={macroGoals.carbs}
          colorClass="bg-carbs"
        />
        <MacroBar
          label="Lipides"
          consumed={consumedMacros.fat}
          goal={macroGoals.fat}
          colorClass="bg-fat"
        />
      </div>
    </div>
  );
};

const MealNutritionCircle = ({
    value,
    label,
    colorClass,
    goal,
  }: {
    value: number;
    label: string;
    colorClass: string;
    goal: number;
  }) => {
    const percentage = goal > 0 ? (value / goal) * 100 : 0;
    const circumference = 2 * Math.PI * 10;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-6 h-6">
                <svg className="w-full h-full" viewBox="0 0 24 24">
                <circle className="stroke-current text-white/20" strokeWidth="2.5" fill="none" cx="12" cy="12" r="10" />
                <circle
                    className={`stroke-current ${colorClass}`}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    cx="12"
                    cy="12"
                    r="10"
                    transform="rotate(-90 12 12)"
                    style={{ strokeDasharray: circumference, strokeDashoffset, transition: "stroke-dashoffset 0.5s" }}
                />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-bold text-[10px]">{Math.round(value)}</span>
            </div>
            <p className="text-[10px] mt-0.5">{label}</p>
        </div>
    );
};
  

const MealNutritionInfo = ({ meals }: { meals: Meal[] }) => {
    const totals = meals.reduce((acc, meal) => {
        acc.calories += meal?.calories || 0;
        acc.protein += meal?.macros.protein || 0;
        acc.carbs += meal?.macros.carbs || 0;
        acc.fat += meal?.macros.fat || 0;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Approximate goals for a single meal
    const mealGoals = { calories: 600, protein: 40, carbs: 70, fat: 20 };
  
    return (
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/40 backdrop-blur-sm">
          <div className="flex justify-around items-center text-center text-xs text-white">
            <MealNutritionCircle value={totals.calories} label="Kcal" colorClass="text-primary" goal={mealGoals.calories} />
            <MealNutritionCircle value={totals.protein} label="Prot" colorClass="text-protein" goal={mealGoals.protein} />
            <MealNutritionCircle value={totals.carbs} label="Gluc" colorClass="text-carbs" goal={mealGoals.carbs} />
            <MealNutritionCircle value={totals.fat} label="Lip" colorClass="text-fat" goal={mealGoals.fat} />
          </div>
      </div>
    )
}

export const MealCard = ({ title, meals, onAdd, defaultImage }: { title: string; meals: Meal[]; onAdd: () => void; defaultImage: string; }) => {
  return (
    <Card className="relative rounded-2xl overflow-hidden shadow-lg h-48 group" onClick={onAdd}>
      <Image
        src={meals[0]?.imageUrl || defaultImage}
        alt={title}
        layout="fill"
        objectFit="cover"
        className="z-0 group-hover:scale-105 transition-transform duration-300"
        data-ai-hint="healthy food"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>
      
      <CardContent className="relative z-20 flex flex-col justify-between h-full p-3 text-white">
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg font-heading">{title}</h3>
             <button className="bg-white hover:bg-gray-200 text-primary rounded-full w-8 h-8 flex items-center justify-center shrink-0 shadow-md">
                <Plus className="w-5 h-5" />
            </button>
        </div>
         <MealNutritionInfo meals={meals} />
      </CardContent>
    </Card>
  );
};
