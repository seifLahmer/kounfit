
import Image from "next/image";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Meal } from "@/lib/types";


export const NutritionSummary = ({ consumed, goal }: { consumed: number; goal: number }) => {
  const remaining = goal - consumed;
  const percentage = goal > 0 ? (consumed / goal) * 100 : 0;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center justify-around">
      <div className="flex flex-col items-center">
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
             <span className="text-2xl font-bold">{consumed}</span>
             <span className="text-xs text-muted-foreground">dans la cible</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center text-center">
          <span className="text-xs text-muted-foreground">consommées</span>
          <span className="text-4xl font-bold">{remaining < 0 ? 0 : remaining}</span>
          <span className="text-sm text-muted-foreground">kcal restantes</span>
          <svg width="40" height="4" viewBox="0 0 40 4" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-300 mt-1">
            <path d="M2 2C8.5 4.5 22 -2 38 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
      </div>
    </div>
  );
}

export const MacroCard = ({ label, consumed, goal }: { label: string; consumed: number; goal: number }) => {
  const percentage = goal > 0 ? (consumed / goal) * 100 : 0;
  return (
    <Card className="shadow-md">
      <CardContent className="p-3 text-center space-y-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{consumed}g</p>
        <p className="text-xs text-muted-foreground">sur {goal}g</p>
        <Progress value={percentage} className="h-1.5" />
        <p className="text-xs text-muted-foreground pt-1">{Math.round(percentage)}%</p>
      </CardContent>
    </Card>
  )
}

const MealNutritionInfo = ({ meals }: { meals: Meal[] }) => {
  const totals = meals.reduce((acc, meal) => {
    acc.calories += meal.calories || 0;
    acc.protein += meal.macros.protein || 0;
    acc.carbs += meal.macros.carbs || 0;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0 });

  return (
    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/30 backdrop-blur-sm">
        <div className="flex justify-around text-center text-xs">
          <div>
            <p className="font-bold">{Math.round(totals.calories)}</p>
            <p>Kcal</p>
          </div>
          <div>
            <p className="font-bold">{Math.round(totals.protein)}</p>
            <p>Protéines</p>
          </div>
          <div>
            <p className="font-bold">{Math.round(totals.carbs)}</p>
            <p>Glucides</p>
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
             <button className="bg-primary hover:bg-primary/90 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 shadow-md">
                <Plus className="w-5 h-5" />
            </button>
        </div>
         <MealNutritionInfo meals={meals} />
      </CardContent>
    </Card>
  );
};
