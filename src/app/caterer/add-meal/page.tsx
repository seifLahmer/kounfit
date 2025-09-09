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
import { Loader2, Upload, CheckCircle, Trash2, PlusCircle } from "lucide-react";
import { addMeal } from "@/lib/services/mealService";
import { uploadMealImage } from "@/lib/services/storageService";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft } from "lucide-react";

const mealSchema = z.object({
  name: z.string().min(1, "Le nom du repas est requis."),
  description: z.string().min(1, "La description est requise."),
  price: z.coerce.number().min(0, "Le prix doit être positif."),
  category: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  availability: z.boolean().default(true),
  calories: z.coerce.number().min(0, "Les calories sont requises."),
  protein: z.coerce.number().min(0, "Les protéines sont requises."),
  carbs: z.coerce.number().min(0, "Les glucides sont requis."),
  fat: z.coerce.number().min(0, "Les lipides sont requis."),
  fibers: z.coerce.number().min(0).optional(),
});

type MealFormValues = z.infer<typeof mealSchema>;
type Ingredient = { name: string; grams: number };
type Macros = { calories: number; protein: number; carbs: number; fat: number; fibers: number };
type InitialAnalysis = {
  mealName?: string;
  description?: string;
  ingredients?: Ingredient[];
  totalMacros?: Macros;
};

interface AddMealFormProps {
  initialAnalysis?: InitialAnalysis;
}

export default function AddMealForm({ initialAnalysis }: AddMealFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialAnalysis?.ingredients || []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [catererUid, setCatererUid] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCatererUid(user.uid);
      else router.push("/login");
    });
    return () => unsubscribe();
  }, [router]);

  // Prépremplissage 
  const form = useForm<MealFormValues>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      name: initialAnalysis?.mealName || "",
      description: initialAnalysis?.description || "",
      price: 0,
      category: "lunch",
      availability: true,
      calories: initialAnalysis?.totalMacros?.calories || 0,
      protein: initialAnalysis?.totalMacros?.protein || 0,
      carbs: initialAnalysis?.totalMacros?.carbs || 0,
      fat: initialAnalysis?.totalMacros?.fat || 0,
      fibers: initialAnalysis?.totalMacros?.fibers || 0,
    },
  });

  useEffect(() => {
    if (initialAnalysis?.ingredients) setIngredients(initialAnalysis.ingredients);
  }, [initialAnalysis]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string | number
  ) => {
    const newIngredients = [...ingredients];
    if (field === "grams" && typeof value === "string") {
      newIngredients[index][field] = parseInt(value, 10) || 0;
    } else {
      // @ts-expect-error: name is always string, grams always number
      newIngredients[index][field] = value;
    }
    setIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", grams: 0 }]);
  };

  const handleRemoveIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data: MealFormValues) => {
    if (!catererUid) {
      toast({
        title: "Erreur d'authentification",
        description: "Utilisateur non connecté.",
        variant: "destructive",
      });
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

      const mealData: any = {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        availability: data.availability,
        imageUrl: imageUrl,
        ingredients: ingredients,
        calories: data.calories,
        macros: {
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          fibers: data.fibers,
        },
        createdBy: catererUid,
      };

      if (imagePath) {
        mealData.imageRef = imagePath;
      }
      await addMeal(mealData);

      toast({
        title: "Repas ajouté!",
        description: `${data.name} a été ajouté avec succès.`,
        action: <CheckCircle className="text-green-500" />,
      });
      router.push("/caterer");
    } catch (error) {
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder le repas.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
       <Button
         type="button" // ⬅️ Ajout important

              variant="outline"
              onClick={() => router.push("/caterer/meal-ai")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
                <h4 className="text-2xl font-bold mb-4">Etape 2 : Vérifier les ingrédients</h4>

      <Card>
        <CardHeader>
          <CardTitle>Détails du Repas</CardTitle>
          <CardDescription>
            Vérifiez et modifiez les informations proposées par l'IA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 space-y-2">
              <Label>Image du repas</Label>
              <div
                className="relative aspect-video w-full bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    layout="fill"
                    objectFit="cover"
                    alt="Aperçu du repas"
                    className="rounded-lg"
                  />
                ) : (
                  <div className="text-center text-muted-foreground p-4">
                    <Upload className="mx-auto h-8 w-8" />
                    <p>Cliquez pour télécharger</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            <div className="w-full md:w-2/3 space-y-4">
              <div>
                <Label htmlFor="name">Nom du repas</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-destructive text-sm mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...form.register("description")} />
                {form.formState.errors.description && (
                  <p className="text-destructive text-sm mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div>
              <Label htmlFor="price">Prix (DT)</Label>
              <Input id="price" type="number" step="0.1" {...form.register("price")} />
              {form.formState.errors.price && (
                <p className="text-destructive text-sm mt-1">{form.formState.errors.price.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                    <Switch
                      id="availability"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
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
          <CardDescription>Modifiez les macros et ingrédients générés.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div>
              <Label htmlFor="calories">Calories (Kcal)</Label>
              <Input id="calories" type="number" {...form.register("calories")} />
              {form.formState.errors.calories && (
                <p className="text-destructive text-sm mt-1">
                  {form.formState.errors.calories.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="protein">Protéines (g)</Label>
              <Input id="protein" type="number" {...form.register("protein")} />
              {form.formState.errors.protein && (
                <p className="text-destructive text-sm mt-1">
                  {form.formState.errors.protein.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="carbs">Glucides (g)</Label>
              <Input id="carbs" type="number" {...form.register("carbs")} />
              {form.formState.errors.carbs && (
                <p className="text-destructive text-sm mt-1">
                  {form.formState.errors.carbs.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="fat">Lipides (g)</Label>
              <Input id="fat" type="number" {...form.register("fat")} />
              {form.formState.errors.fat && (
                <p className="text-destructive text-sm mt-1">
                  {form.formState.errors.fat.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="fibers">Fibres (g)</Label>
              <Input id="fibers" type="number" {...form.register("fibers")} />
              {form.formState.errors.fibers && (
                <p className="text-destructive text-sm mt-1">
                  {form.formState.errors.fibers.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <Label>Ingrédients</Label>
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  placeholder="Nom de l'ingrédient"
                  value={ing.name}
                  onChange={e => handleIngredientChange(idx, "name", e.target.value)}
                  className="flex-grow"
                />
                <Input
                  type="number"
                  placeholder="g"
                  value={ing.grams}
                  onChange={e => handleIngredientChange(idx, "grams", Number(e.target.value))}
                  className="w-24"
                />
                <Button variant="ghost" size="icon" onClick={() => handleRemoveIngredient(idx)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddIngredient}
              className="mt-2"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un ingrédient
            </Button>
          </div>
        </CardContent>
      </Card>
      <Button
        type="submit"
        size="lg"
        className="w-full h-12 bg-secondary text-white hover:bg-secondary/90"
        disabled={isSaving}
      >
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2" />}
        {isSaving ? "Sauvegarde en cours..." : "Sauvegarder le Repas"}
      </Button>
    </form>
  );
}
