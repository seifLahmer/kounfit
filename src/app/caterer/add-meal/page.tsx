
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Upload, ChevronLeft, CheckCircle, Trash2, PlusCircle } from "lucide-react";
import { analyzeMeal, type MealAnalysis } from "@/ai/flows/meal-analysis-flow";
import { addMeal } from "@/lib/services/mealService";
import { uploadMealImage } from "@/lib/services/storageService";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from 'firebase/auth';

const mealSchema = z.object({
  name: z.string().min(1, "Le nom du repas est requis."),
  description: z.string().min(1, "La description est requise."),
  price: z.coerce.number().min(0, "Le prix doit être positif."),
  category: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  availability: z.boolean().default(true),
});

type MealFormValues = z.infer<typeof mealSchema>;

export default function AddMealPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mealNameInput, setMealNameInput] = useState("");
  const [analysisResult, setAnalysisResult] = useState<MealAnalysis | null>(null);
  const [ingredients, setIngredients] = useState<{ name: string; grams: number }[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [catererUid, setCatererUid] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setCatererUid(user.uid);
        } else {
            router.push('/login');
        }
    });
    return () => unsubscribe();
  }, [router]);

  const form = useForm<MealFormValues>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "lunch",
      availability: true,
    },
  });

  const handleAnalyze = async () => {
    if (!mealNameInput) {
      toast({ title: "Nom du repas requis", description: "Veuillez saisir un nom de repas à analyser.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setIngredients([]);
    try {
      const result = await analyzeMeal({ mealName: mealNameInput });
      setAnalysisResult(result);
      setIngredients(result.ingredients);
      form.reset({
        name: result.mealName,
        description: result.description,
        price: 0, // Reset price, let caterer set it
        category: "lunch",
        availability: true,
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur d'analyse", description: "L'IA n'a pas pu analyser ce repas. Essayez un autre nom.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleIngredientChange = (index: number, field: 'name' | 'grams', value: string | number) => {
    const newIngredients = [...ingredients];
    if(field === 'grams' && typeof value === 'string') {
        newIngredients[index][field] = parseInt(value, 10) || 0;
    } else {
        newIngredients[index][field] = value as any;
    }
    setIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', grams: 0 }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };


  const onSubmit = async (data: MealFormValues) => {
     if (!analysisResult) {
      toast({ title: "Analyse requise", description: "Veuillez d'abord analyser un repas.", variant: "destructive" });
      return;
    }
     if (!catererUid) {
        toast({ title: "Erreur d'authentification", description: "Utilisateur non connecté.", variant: "destructive" });
        return;
    }

    setIsSaving(true);
    try {
        let imageUrl = "https://placehold.co/600x400.png";
        let imagePath: string | undefined = undefined;

        if (imageFile) {
            const result = await uploadMealImage(catererUid, imageFile);
            imageUrl = result.downloadURL;
            imagePath = result.imagePath;
        }
        
        await addMeal({
            ...data,
            imageUrl: imageUrl,
            imageRef: imagePath,
            ingredients: ingredients, // Use the edited ingredients
            calories: analysisResult.totalMacros.calories,
            macros: analysisResult.totalMacros,
            createdBy: catererUid,
        });

      toast({
        title: "Repas ajouté!",
        description: `${data.name} a été ajouté avec succès.`,
        action: <CheckCircle className="text-green-500" />,
      });
      router.push("/caterer");

    } catch (error) {
      console.error(error);
      toast({ title: "Erreur de sauvegarde", description: "Impossible de sauvegarder le repas.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
       <header className="p-4 flex items-center gap-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft />
        </Button>
        <h1 className="text-xl font-bold">Ajouter un nouveau repas</h1>
      </header>

      <div className="p-4 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Étape 1 : Analyse par IA</CardTitle>
                <CardDescription>Saisissez le nom d'un plat (ex: "Poulet grillé et légumes"). Notre IA estimera les ingrédients et les informations nutritionnelles pour vous.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                        placeholder="Nom du repas..."
                        value={mealNameInput}
                        onChange={(e) => setMealNameInput(e.target.value)}
                        className="h-12 flex-grow"
                    />
                    <Button onClick={handleAnalyze} disabled={isAnalyzing} className="h-12 bg-primary hover:bg-primary/90">
                        {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2" />}
                        {isAnalyzing ? "Analyse en cours..." : "Analyser avec l'IA"}
                    </Button>
                </div>
            </CardContent>
        </Card>

        {analysisResult && (
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                     <CardHeader>
                        <CardTitle>Étape 2 : Vérifiez et ajustez</CardTitle>
                        <CardDescription>Modifiez les détails générés par l'IA et ajoutez vos propres informations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-6">
                             {/* Image Upload */}
                            <div className="w-full md:w-1/3 space-y-2">
                                <Label>Image du repas</Label>
                                <div 
                                    className="relative aspect-video w-full bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imagePreview ? (
                                        <Image src={imagePreview} layout="fill" objectFit="cover" alt="Aperçu du repas" className="rounded-lg" />
                                    ) : (
                                        <div className="text-center text-muted-foreground p-4">
                                            <Upload className="mx-auto h-8 w-8"/>
                                            <p>Cliquez pour télécharger</p>
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                            </div>
                            {/* Form Fields */}
                            <div className="w-full md:w-2/3 space-y-4">
                                <div>
                                    <Label htmlFor="name">Nom du repas</Label>
                                    <Input id="name" {...form.register("name")} />
                                    {form.formState.errors.name && <p className="text-destructive text-sm mt-1">{form.formState.errors.name.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" {...form.register("description")} />
                                     {form.formState.errors.description && <p className="text-destructive text-sm mt-1">{form.formState.errors.description.message}</p>}
                                </div>
                            </div>
                        </div>

                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                             <div>
                                <Label htmlFor="price">Prix (DT)</Label>
                                <Input id="price" type="number" step="0.1" {...form.register("price")} />
                                {form.formState.errors.price && <p className="text-destructive text-sm mt-1">{form.formState.errors.price.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="category">Catégorie</Label>
                                <Controller
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="breakfast">Petit déjeuner</SelectItem>
                                                <SelectItem value="lunch">Déjeuner</SelectItem>
                                                <SelectItem value="dinner">Dîner</SelectItem>
                                                <SelectItem value="snack">Collation</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Label>Disponibilité</Label>
                                <div className="flex items-center space-x-2">
                                     <Controller
                                        control={form.control}
                                        name="availability"
                                        render={({ field }) => (
                                             <Switch id="availability" checked={field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                    <span>{form.watch("availability") ? "Disponible" : "Indisponible"}</span>
                                </div>
                            </div>
                       </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Détails Nutritionnels & Ingrédients</CardTitle>
                        <CardDescription>Les macros sont des estimations de l'IA. Ajustez la liste d'ingrédients ci-dessous.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="flex justify-around bg-muted p-4 rounded-lg text-center mb-6">
                            <div><p className="font-bold text-lg">{analysisResult.totalMacros.calories}</p><p className="text-sm">Kcal</p></div>
                            <div><p className="font-bold text-lg">{analysisResult.totalMacros.protein}g</p><p className="text-sm">Protéines</p></div>
                            <div><p className="font-bold text-lg">{analysisResult.totalMacros.carbs}g</p><p className="text-sm">Glucides</p></div>
                            <div><p className="font-bold text-lg">{analysisResult.totalMacros.fat}g</p><p className="text-sm">Lipides</p></div>
                         </div>
                        
                         <div className="space-y-4">
                            <Label>Ingrédients</Label>
                            {ingredients.map((ing, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <Input 
                                        placeholder="Nom de l'ingrédient" 
                                        value={ing.name}
                                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                                        className="flex-grow"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="g"
                                        value={ing.grams}
                                        onChange={(e) => handleIngredientChange(index, 'grams', e.target.value)}
                                        className="w-24"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveIngredient(index)}>
                                        <Trash2 className="w-4 h-4 text-destructive"/>
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={handleAddIngredient} className="mt-2">
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                Ajouter un ingrédient
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full h-12 bg-secondary text-white hover:bg-secondary/90" disabled={isSaving}>
                     {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2"/>}
                    {isSaving ? "Sauvegarde en cours..." : "Sauvegarder le Repas"}
                </Button>
            </form>
        )}
      </div>
    </div>
  );
}
