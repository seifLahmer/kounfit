
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
        </div>
    </div>
  );
};

export const MacroCard = ({ name, consumed, goal, color }: { name: string; consumed: number; goal: number; color: string }) => {
  const percentage = goal > 0 ? (consumed / goal) * 100 : 0;
  return (
    <Card className="flex-1 shadow-lg">
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


export const MacroGrid = ({ consumedMacros, macroGoals, calorieGoal }: { consumedMacros: { protein: number, carbs: number, fat: number }, macroGoals: User['macroRatio'], calorieGoal: number }) => {
  return (
     <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-2 shadow-lg">
             <CardContent className="p-4 flex justify-around">
                <div className="text-center">
                    <p className="font-bold text-lg">{macroGoals.protein} g</p>
                    <p className="text-sm text-muted-foreground">Protéines</p>
                </div>
                <div className="text-center">
                    <p className="font-bold text-lg">{macroGoals.carbs} g</p>
                    <p className="text-sm text-muted-foreground">Glucides</p>
                </div>
                <div className="text-center">
                    <p className="font-bold text-lg">{macroGoals.fat} g</p>
                    <p className="text-sm text-muted-foreground">Lipides</p>
                </div>
            </CardContent>
        </Card>
    </div>
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
