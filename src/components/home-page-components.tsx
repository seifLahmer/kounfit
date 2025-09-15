
import Image from "next/image";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Meal } from "@/lib/types";

const CalorieCircle = ({ consumed, goal }: { consumed: number; goal: number }) => {
  const percentage = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="stroke-current text-gray-200"
          strokeWidth="8"
          fill="none"
          cx="50"
          cy="50"
          r="40"
        />
        <circle
          className="stroke-current text-primary"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          cx="50"
          cy="50"
          r="40"
          transform="rotate(-90 50 50)"
          style={{ strokeDasharray: circumference, strokeDashoffset, transition: "stroke-dashoffset 0.5s" }}
        />
        <text x="50%" y="45%" textAnchor="middle" dy=".3em" className="text-xl font-bold fill-current">
          {Math.round(consumed)}
        </text>
        <text x="50%" y="60%" textAnchor="middle" dy=".3em" className="text-xs fill-muted-foreground">
          dans la cible
        </text>
      </svg>
    </div>
  );
};

const MacroCard = ({
  label,
  consumed,
  goal,
}: {
  label: string;
  consumed: number;
  goal: number;
}) => {
  const percentage = goal > 0 ? Math.round((consumed / goal) * 100) : 0;
  return (
    <Card className="flex-1 shadow-md rounded-2xl">
      <CardContent className="p-3 space-y-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-1">
          <p className="text-xl font-bold">{consumed.toFixed(2)}</p>
          <p className="text-sm font-semibold">g</p>
        </div>
        <p className="text-xs text-muted-foreground">sur {goal} g</p>
        <div className="flex items-center gap-2">
            <Progress value={percentage} className="h-1.5 w-full" />
            <span className="text-xs text-muted-foreground">{percentage}%</span>
        </div>
      </CardContent>
    </Card>
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
  const remainingCalories = calorieGoal - consumedCalories;

  return (
    <div className="space-y-4">
      <Card className="shadow-lg rounded-2xl">
        <CardContent className="p-4 flex items-center justify-between">
          <CalorieCircle consumed={consumedCalories} goal={calorieGoal} />
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Restant / consommées</p>
            <p className="text-4xl font-bold">{remainingCalories.toFixed(1)}</p>
            <p className="text-md text-muted-foreground">kcal restantes</p>
             <svg width="60" height="8" viewBox="0 0 60 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-auto mt-1">
                <path d="M1 6.5C8.66667 2.5 18.2 -1.1 29 2C41.2 5.5 51.8333 6.33333 59 4.5" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-3">
        <MacroCard label="Protéines" consumed={consumedMacros.protein} goal={macroGoals.protein} />
        <MacroCard label="Glucides" consumed={consumedMacros.carbs} goal={macroGoals.carbs} />
        <MacroCard label="Lipides" consumed={consumedMacros.fat} goal={macroGoals.fat} />
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
    const percentage = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
    const circumference = 2 * Math.PI * 14; // radius = 14
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-9 h-9">
                <svg className="w-full h-full" viewBox="0 0 32 32">
                <circle className="stroke-current text-white/20" strokeWidth="2" fill="none" cx="16" cy="16" r="14" />
                <circle
                    className={`stroke-current ${colorClass}`}
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    cx="16"
                    cy="16"
                    r="14"
                    transform="rotate(-90 16 16)"
                    style={{ strokeDasharray: circumference, strokeDashoffset, transition: "stroke-dashoffset 0.5s" }}
                />
                 <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dy=".3em"
                    className="text-[9px] font-bold fill-white"
                >
                    {Math.round(value)}
                </text>
                </svg>
            </div>
            <p className="text-[10px] mt-1">{label}</p>
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

    // These are arbitrary goals for the small circles, adjust as needed for visual representation.
    const mealGoals = { calories: 600, protein: 40, carbs: 70, fat: 20 };
  
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-center text-xs text-white">
            <MealNutritionCircle value={totals.calories} label="Kcal" colorClass="text-primary" goal={mealGoals.calories} />
            <MealNutritionCircle value={totals.protein} label="Prot" colorClass="text-protein" goal={mealGoals.protein} />
            <MealNutritionCircle value={totals.carbs} label="Gluc" colorClass="text-carbs" goal={mealGoals.carbs} />
            <MealNutritionCircle value={totals.fat} label="Lip" colorClass="text-fat" goal={mealGoals.fat} />
        </div>
      </div>
    )
}

export const MealCard = ({ title, meals, onAdd, defaultImage }: { title: string; meals: Meal[]; onAdd: () => void; defaultImage: string; }) => {
    const hasMeals = meals.length > 0;
    const cardImage = hasMeals ? meals[0].imageUrl : defaultImage;
  
    return (
      <Card 
        className="relative rounded-2xl overflow-hidden shadow-lg h-48 group cursor-pointer"
        onClick={onAdd}
      >
        <Image
          src={cardImage}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="z-0 transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={hasMeals ? meals[0].name : "healthy food"}
        />
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
        
        <CardContent className="relative z-20 flex flex-col justify-between h-full p-3 text-white">
          <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg font-heading">{title}</h3>
               <button 
                  onClick={(e) => { 
                      e.stopPropagation();
                      onAdd(); 
                  }} 
                  className="bg-white hover:bg-gray-200 text-primary rounded-full w-8 h-8 flex items-center justify-center shrink-0 shadow-md"
              >
                  <Plus className="w-5 h-5" />
              </button>
          </div>
          
          <div className="flex-grow flex flex-col justify-end space-y-1 overflow-y-auto pr-2" style={{maxHeight: "80px"}}>
              {hasMeals ? (
                  meals.map(meal => (
                      <div key={meal.id} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-1.5 rounded-lg"
                           onClick={(e) => e.stopPropagation()} // Prevent card's onAdd when clicking a meal
                      >
                          <Image src={meal.imageUrl} alt={meal.name} width={28} height={28} className="rounded-md w-7 h-7 object-cover"/>
                          <span className="text-xs font-medium truncate">{meal.name}</span>
                      </div>
                  ))
              ) : (
                  <div className="flex-grow flex items-center justify-center h-full">
                      <p className="text-sm text-white/80">Ajouter un repas</p>
                  </div>
              )}
          </div>
  
           <MealNutritionInfo meals={meals} />
        </CardContent>
      </Card>
    );
  };
