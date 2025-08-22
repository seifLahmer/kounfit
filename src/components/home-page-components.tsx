
import Image from "next/image";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Meal, User } from "@/lib/types";

const ProgressCircle = ({
  value,
  goal,
  label,
  unit,
  colorClass,
}: {
  value: number;
  goal: number;
  label: string;
  unit: string;
  colorClass: string;
}) => {
  const percentage = goal > 0 ? (value / goal) * 100 : 0;
  const circumference = 2 * Math.PI * 28; // radius = 28
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full" viewBox="0 0 64 64">
          <circle
            className="stroke-current text-gray-200"
            strokeWidth="6"
            fill="none"
            cx="32"
            cy="32"
            r="28"
          />
          <circle
            className={`stroke-current ${colorClass}`}
            strokeWidth="6"
            fill="none"
            cx="32"
            cy="32"
            r="28"
            strokeLinecap="round"
            transform="rotate(-90 32 32)"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: "stroke-dashoffset 0.5s",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold font-heading text-foreground">
            {value}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <p className="mt-1 text-sm font-medium">{label}</p>
    </div>
  );
};


export const NutritionGrid = ({
  consumedCalories,
  calorieGoal,
  consumedMacros,
  macroGoals,
}: {
  consumedCalories: number;
  calorieGoal: number;
  consumedMacros: { protein: number; carbs: number; fat: number };
  macroGoals: User['macroRatio'];
}) => {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-4 grid grid-cols-2 gap-y-4 gap-x-2">
        <ProgressCircle
          value={consumedCalories}
          goal={calorieGoal}
          label="Calories"
          unit="Kcal"
          colorClass="text-primary"
        />
        <ProgressCircle
          value={consumedMacros.protein}
          goal={macroGoals.protein}
          label="Protéines"
          unit="g"
          colorClass="text-protein"
        />
        <ProgressCircle
          value={consumedMacros.carbs}
          goal={macroGoals.carbs}
          label="Glucides"
          unit="g"
          colorClass="text-carbs"
        />
        <ProgressCircle
          value={consumedMacros.fat}
          goal={macroGoals.fat}
          label="Lipides"
          unit="g"
          colorClass="text-fat"
        />
      </CardContent>
    </Card>
  );
};


export const MealGridCard = ({ title, meals, onAdd, defaultImage }: { title: string; meals: Meal[]; onAdd: () => void; defaultImage: string; }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg h-48 flex flex-col justify-between p-3 text-white" onClick={onAdd}>
      <Image
        src={defaultImage}
        alt={title}
        layout="fill"
        objectFit="cover"
        className="z-0"
        data-ai-hint="healthy food"
      />
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      <div className="relative z-20 flex flex-col justify-between h-full">
         <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg font-heading">{title}</h3>
            <button className="bg-primary hover:bg-primary/90 text-white rounded-full w-8 h-8 flex items-center justify-center z-20 shrink-0">
                <Plus className="w-5 h-5" />
            </button>
         </div>
      </div>
    </div>
  );
};
