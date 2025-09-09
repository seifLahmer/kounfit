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
      const response = await fetch("/api/meal-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mealName }),
      });
      if (!response.ok) throw new Error("Erreur d'analyse IA");
      const result = await response.json();
      setAnalysisResult(result);
      setStep(2); // Passe à l'étape suivante
    } catch (error) {
      alert(error || "L'IA n'a pas pu générer le plat.");
      console.log (error)
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
