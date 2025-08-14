import Image from "next/image";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Meal, User } from "@/lib/types";


export const CalorieCircle = ({ consumed, goal }: { consumed: number; goal: number }) => {
  const percentage = goal > 0 ? (consumed / goal) * 100 : 0;
  const circumference = 2 * Math.PI * 56; // radius = 56
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                className="stroke-current text-gray-200"
                strokeWidth="8"
                fill="none"
                cx="60"
                cy="60"
                r="56"
                />
                <circle
                className="stroke-current text-primary"
                strokeWidth="8"
                fill="none"
                cx="60"
                cy="60"
                r="56"
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ strokeDasharray: circumference, strokeDashoffset, transition: "stroke-dashoffset 0.5s" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-heading text-foreground">{consumed}</span>
                <span className="text-sm text-muted-foreground">dans la cible</span>
            </div>
        </div>
        <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Restant / consommées</span>
            <span className="text-4xl font-bold font-heading text-foreground">{Math.max(0, goal - consumed)}</span>
            <span className="text-lg text-muted-foreground">kcal restantes</span>
             <svg width="100" height="20" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-2">
                <path d="M2 10C12.0667 2.33333 24.4 -1.4 34 5C45 12.5 56.6667 15.1667 66.5 12C76.3333 8.83333 86.5 7.5 98 14" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        </div>
    </div>
  );
};

export const MacroCard = ({ name, consumed, goal, color }: { name: string; consumed: number; goal: number; color: string }) => {
  const percentage = goal > 0 ? (consumed / goal) * 100 : 0;
  return (
    <Card className="flex-1">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{name}</p>
        <p className="text-2xl font-bold font-heading text-foreground">{consumed} g</p>
        <p className="text-xs text-muted-foreground">sur {goal} g</p>
        <Progress value={percentage} indicatorClassName={color} className="h-2 mt-2" />
         <p className="text-right text-xs mt-1 text-muted-foreground">{Math.round(percentage)}%</p>
      </CardContent>
    </Card>
  );
};

export const MetricProgressCircle = ({ consumed, goal, colorClass, label }: { consumed: number; goal: number; colorClass: string; label: string }) => {
  const percentage = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 18; // radius = 18
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1 text-white">
      <div className="relative w-10 h-10">
        <svg className="w-full h-full" viewBox="0 0 40 40">
          <circle className="stroke-current text-white/20" strokeWidth="3" fill="none" cx="20" cy="20" r="18" />
          <circle
            className={`stroke-current ${colorClass}`}
            strokeWidth="3"
            fill="none"
            cx="20"
            cy="20"
            r="18"
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
            style={{ strokeDasharray: circumference, strokeDashoffset, transition: "stroke-dashoffset 0.5s" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-xs">
          {Math.round(consumed)}
        </div>
      </div>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
};


export const MealGridCard = ({ title, meals, onAdd, defaultImage, calorieGoal, macroGoals }: { title: string; meals: Meal[]; onAdd: () => void; defaultImage: string; calorieGoal: number; macroGoals: User['macroRatio'] }) => {
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalMacros = meals.reduce((sum, meal) => {
    sum.protein += meal.macros.protein || 0;
    sum.carbs += meal.macros.carbs || 0;
    sum.fat += meal.macros.fat || 0;
    return sum;
  }, { protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="relative rounded-lg overflow-hidden shadow-sm h-48 flex flex-col justify-between p-3 text-white" onClick={onAdd}>
      <Image
        src={defaultImage}
        alt={title}
        layout="fill"
        objectFit="cover"
        className="z-0"
        data-ai-hint="healthy food"
      />
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      <div className="relative z-20 flex flex-col justify-between h-full">
         <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg font-heading">{title}</h3>
            <button className="bg-primary hover:bg-primary/90 text-white rounded-full w-8 h-8 flex items-center justify-center z-20 shrink-0">
                <Plus className="w-5 h-5" />
            </button>
         </div>
         <div className="flex justify-around items-end">
             <MetricProgressCircle consumed={totalCalories} goal={calorieGoal / 4} colorClass="text-primary" label="Kcal" />
             <MetricProgressCircle consumed={totalMacros.protein} goal={macroGoals.protein / 4} colorClass="text-protein" label="Protéines" />
             <MetricProgressCircle consumed={totalMacros.carbs} goal={macroGoals.carbs / 4} colorClass="text-carbs" label="Glucides" />
             <MetricProgressCircle consumed={totalMacros.fat} goal={macroGoals.fat / 4} colorClass="text-fat" label="Lipides" />
         </div>
      </div>
    </div>
  );
};
