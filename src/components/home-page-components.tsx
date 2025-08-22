
import Image from "next/image";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Meal } from "@/lib/types";

const MacroCircle = ({
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
  const circumference = 2 * Math.PI * 18; // radius = 18
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-12 h-12">
        <svg className="w-full h-full" viewBox="0 0 40 40">
          <circle
            className="stroke-current text-gray-200"
            strokeWidth="3"
            fill="none"
            cx="20"
            cy="20"
            r="18"
          />
          <circle
            className={`stroke-current ${colorClass}`}
            strokeWidth="3"
            fill="none"
            cx="20"
            cy="20"
            r="18"
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: "stroke-dashoffset 0.5s",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold">{Math.round(consumed)}g</span>
        </div>
      </div>
      <span className="text-xs font-medium mt-1">{label}</span>
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
  const remaining = calorieGoal > consumedCalories ? calorieGoal - consumedCalories : 0;
  const percentage = calorieGoal > 0 ? (consumedCalories / calorieGoal) * 100 : 0;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="stroke-current text-gray-200"
              strokeWidth="8"
              fill="none"
              cx="50"
              cy="50"
              r="45"
            />
            <circle
              className="stroke-current text-primary"
              strokeWidth="8"
              fill="none"
              cx="50"
              cy="50"
              r="45"
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
            <span className="text-2xl font-bold">{consumedCalories}</span>
            <span className="text-xs text-muted-foreground">dans la cible</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <MacroCircle
          label="Protéines"
          consumed={consumedMacros.protein}
          goal={macroGoals.protein}
          colorClass="text-protein"
        />
        <MacroCircle
          label="Glucides"
          consumed={consumedMacros.carbs}
          goal={macroGoals.carbs}
          colorClass="text-carbs"
        />
         <MacroCircle
          label="Lipides"
          consumed={consumedMacros.fat}
          goal={macroGoals.fat}
          colorClass="text-fat"
        />
      </div>
    </div>
  );
};

const MealNutritionInfo = ({ meals }: { meals: Meal[] }) => {
  const totals = meals.reduce((acc, meal) => {
    acc.calories += meal?.calories || 0;
    acc.protein += meal?.macros.protein || 0;
    acc.carbs += meal?.macros.carbs || 0;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0 });

  const caloriePercentage = totals.calories > 0 ? Math.min((totals.calories / 700) * 100, 100) : 0;
  const proteinPercentage = totals.protein > 0 ? Math.min((totals.protein / 50) * 100, 100) : 0;
  const carbsPercentage = totals.carbs > 0 ? Math.min((totals.carbs / 80) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 10;

  return (
    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/40 backdrop-blur-sm">
        <div className="flex justify-around items-center text-center text-xs text-white">
          <div className="flex flex-col items-center">
             <div className="relative w-6 h-6">
                <svg className="w-full h-full" viewBox="0 0 24 24">
                  <circle className="stroke-current text-white/20" strokeWidth="2.5" fill="none" cx="12" cy="12" r="10" />
                  <circle
                    className="stroke-current text-primary"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    cx="12"
                    cy="12"
                    r="10"
                    transform="rotate(-90 12 12)"
                    style={{ strokeDasharray: circumference, strokeDashoffset: circumference - (caloriePercentage / 100) * circumference }}
                  />
                </svg>
                 <span className="absolute inset-0 flex items-center justify-center font-bold text-[10px]">{Math.round(totals.calories)}</span>
             </div>
            <p className="text-[10px] mt-0.5">Kcal</p>
          </div>
          <div className="flex flex-col items-center">
            <Progress value={proteinPercentage} className="w-8 h-1 bg-white/20" indicatorClassName="bg-protein" />
            <p className="text-[10px] mt-1">{Math.round(totals.protein)}g Protéines</p>
          </div>
           <div className="flex flex-col items-center">
            <Progress value={carbsPercentage} className="w-8 h-1 bg-white/20" indicatorClassName="bg-carbs" />
            <p className="text-[10px] mt-1">{Math.round(totals.carbs)}g Glucides</p>
          </div>
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
