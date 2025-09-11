"use client";

import { useState, useEffect, useRef } from "react";
import AddMealForm from "../add-meal/page"; // Voir le second fichier ci-dessous
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Bell, ChefHat, PlusCircle, Trash2, CheckCircle, Edit2, MoreHorizontal, Utensils, ClipboardList, Bike, MapPin } from "lucide-react";
import { useRouter } from 'next/navigation';
import { ArrowLeft } from "lucide-react";

export default function MealWizard() {
  const [step, setStep] = useState(1);
  const [mealName, setMealName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const router = useRouter();

  // 1ère étape : Saisie simple du nom
  const handleGenerate = async () => {
    if (!mealName) return;
    setIsGenerating(true);
    try {
      const prompt = `
        You are an expert nutritionist and chef for a meal delivery service.
        Your task is to analyze a meal based on its name to estimate its ingredients and calculate its nutritional profile.

        The user will provide a meal name: "${mealName}".

        Follow these steps:
        1.  **Estimate Ingredients**: Based on the meal name, create a realistic list of common ingredients and their estimated quantities in grams for a single serving.
        2.  **Calculate Nutrition**: For each ingredient, estimate its nutritional values (calories, protein, carbs, fat, fibers). Then, sum them up to get the total nutritional profile for the entire meal.
        3.  **Generate Description**: Write a short, appealing marketing description for the meal, highlighting its key features (e.g., "healthy", "protein-rich", "delicious").
        4.  **Format Output**: Return ONLY the data in the specified JSON format, without any markdown, backticks or "json" specifier.

        The JSON output should have this structure:
        {
          "mealName": "string",
          "description": "string",
          "ingredients": [{ "name": "string", "grams": "number" }],
          "totalMacros": { "calories": "number", "protein": "number", "carbs": "number", "fat": "number", "fibers": "number" }
        }

        Now, analyze the following meal: "${mealName}"
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        console.error("API response:", await response.text());
        throw new Error("Erreur d'analyse IA");
      }

      const result = await response.json();
      
      const analysisText = result.candidates[0].content.parts[0].text;
      
      const cleanedJsonText = analysisText.replace(/```json/g, '').replace(/```/g, '').trim();

      const analysisObject = JSON.parse(cleanedJsonText);

      setAnalysisResult(analysisObject);
      setStep(2); // Passe à l'étape suivante
    } catch (error: any) {
      alert(error.message || "L'IA n'a pas pu générer le plat.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      
    <div className="max-w-xl mx-auto p-6">
      {step === 1 && (
        <div className="space-y-6">
          <Button
        variant="outline"
        onClick={() => router.push("/caterer")}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Button>
            <h2>
    Ajouter un nouveau repas 
    </h2>  
    
          <h4 className="text-2xl font-bold mb-4">Etape 1 : Ajouter un plat avec L'IA</h4>

          <p>Saissiez le nom d'un plat pour l'analysez avec l'IA ( "ex: "Couscous au poulet")
            Notre IA estimera les ingrédients et les valeurs nutritionnelles pour vous .
          </p>
          <Input
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            placeholder="Nom du plat"
            disabled={isGenerating}
            className="mb-4"
          />
          <Button
            onClick={handleGenerate}
            disabled={!mealName || isGenerating}
            className="w-full bg-primary"
          >
            {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : null}
            Générer avec l'IA
          </Button>
        </div>
      )}
      {step === 2 && analysisResult && (
        <AddMealForm initialAnalysis={analysisResult} />
      )}
    </div>
    </div>
  );
}
