
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChefHat, Bot, Sparkles, Loader2, Trash2, Plus, CheckCircle, ImagePlus, DollarSign, ShoppingBasket, ClipboardList } from "lucide-react";
import { analyzeMeal, MealAnalysis } from "@/ai/flows/meal-analysis-flow";
import { addMeal, getMealsByCaterer, deleteMeal } from "@/lib/services/mealService";
import { getOrdersByCaterer, updateOrderStatus } from "@/lib/services/orderService";
import { uploadMealImage } from "@/lib/services/storageService";
import type { Meal, Order } from "@/lib/types";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from '@/components/ui/badge';
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type ConsolidatedIngredients = { [name: string]: { grams: number } };

export default function CatererPage() {
  const [mealDescription, setMealDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysis | null>(null);
  const [catererMeals, setCatererMeals] = useState<Meal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState<Meal['category']>('lunch');
  const [mealImageFile, setMealImageFile] = useState<File | null>(null);
  const [mealImagePreview, setMealImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mealToDelete, setMealToDelete] = useState<Meal | null>(null);

  const { toast } = useToast();

  const fetchCatererData = async () => {
    const user = auth.currentUser;
    if (user) {
        try {
            setLoadingMeals(true);
            setLoadingOrders(true);
            const [meals, receivedOrders] = await Promise.all([
              getMealsByCaterer(user.uid),
              getOrdersByCaterer(user.uid)
            ]);
            setCatererMeals(meals);
            setOrders(receivedOrders);
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de charger vos données.", variant: "destructive" });
        } finally {
            setLoadingMeals(false);
            setLoadingOrders(false);
        }
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        if(user) {
            fetchCatererData();
        }
    });
    return () => unsubscribe();
  }, []);

  const handleGenerateMeal = async () => {
      if (!mealDescription) return;
      setIsGenerating(true);
      setAnalysisResult(null);
      setMealImageFile(null);
      setMealImagePreview(null);
      setPrice(0);
      try {
        const result = await analyzeMeal({ mealName: mealDescription });
        setAnalysisResult(result);
      } catch (error) {
        console.error("Failed to analyze meal:", error);
        toast({ title: "Erreur d'analyse", description: "L'IA n'a pas pu analyser le repas. Veuillez réessayer.", variant: "destructive" });
      } finally {
        setIsGenerating(false);
      }
  };
  
  const handleIngredientChange = (index: number, field: 'name' | 'grams', value: string | number) => {
    if (!analysisResult) return;
    
    const newIngredients = [...analysisResult.ingredients];
    if(field === 'grams') {
        newIngredients[index] = { ...newIngredients[index], [field]: typeof value === 'number' ? value : parseInt(value, 10) || 0 };
    } else {
        newIngredients[index] = { ...newIngredients[index], [field]: value as string };
    }

    setAnalysisResult({ ...analysisResult, ingredients: newIngredients });
  };
  
  const addIngredient = () => {
    if (!analysisResult) return;
    const newIngredients = [...analysisResult.ingredients, { name: '', grams: 0 }];
    setAnalysisResult({ ...analysisResult, ingredients: newIngredients });
  };

  const removeIngredient = (index: number) => {
    if (!analysisResult) return;
    const newIngredients = analysisResult.ingredients.filter((_, i) => i !== index);
    setAnalysisResult({ ...analysisResult, ingredients: newIngredients });
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMealImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMealImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSaveMeal = async () => {
      if (!analysisResult || !auth.currentUser) return;
      if (!price || price <= 0) {
          toast({ title: "Information manquante", description: "Veuillez définir un prix valide pour le repas.", variant: "destructive"});
          return;
      };
      
      setIsSaving(true);
      
      try {
          let imageUrl = `https://placehold.co/600x400.png`;
          let imageRefPath: string | undefined = undefined;
    
          if (mealImageFile) {
            const { downloadURL, imagePath } = await uploadMealImage(auth.currentUser.uid, mealImageFile);
            imageUrl = downloadURL;
            imageRefPath = imagePath;
          }
          
          const mealData: Omit<Meal, 'id' | 'createdAt'> = {
              name: analysisResult.mealName,
              description: analysisResult.description,
              category: category,
              imageUrl: imageUrl, 
              ingredients: analysisResult.ingredients,
              calories: analysisResult.totalMacros.calories,
              macros: {
                  protein: analysisResult.totalMacros.protein,
                  carbs: analysisResult.totalMacros.carbs,
                  fat: analysisResult.totalMacros.fat,
                  fibers: analysisResult.totalMacros.fibers,
              },
              price: price, 
              createdBy: auth.currentUser.uid,
              availability: true,
          };

          if (imageRefPath) {
            (mealData as any).imageRef = imageRefPath;
          }
          await addMeal(mealData);
          toast({
              title: "Repas Sauvegardé!",
              description: `${mealData.name} a été ajouté à votre liste.`,
              action: <CheckCircle className="text-green-500" />,
          });
          
          setAnalysisResult(null);
          setMealDescription("");
          setPrice(0);
          setCategory('lunch');
          setMealImageFile(null);
          setMealImagePreview(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          
          fetchCatererData();

      } catch (error) {
          console.error("Error saving meal:", error);
          let errorMessage = "Le repas n'a pas pu être sauvegardé.";
          if (error instanceof Error) {
            if (error.message.includes('storage')) {
                errorMessage = "Erreur de téléversement de l'image. Vérifiez votre connexion ou les règles de sécurité Firebase.";
            } else if (error.message.includes('undefined')) {
                errorMessage = "Une erreur de données s'est produite. Assurez-vous que tous les champs sont remplis.";
            }
          }
          toast({ title: "Erreur de sauvegarde", description: errorMessage, variant: "destructive" });
      } finally {
          setIsSaving(false);
      }
  };
  
  const handleDeleteMeal = async () => {
    if (!mealToDelete || !auth.currentUser) return;

    try {
      await deleteMeal(mealToDelete.id, mealToDelete.imageRef);
      toast({
        title: "Repas supprimé",
        description: `${mealToDelete.name} a été retiré de votre liste.`,
        variant: "default",
      });
      fetchCatererData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le repas.",
        variant: "destructive",
      });
    } finally {
      setMealToDelete(null);
    }
  };
  
  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
        await updateOrderStatus(orderId, newStatus);
        setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? {...o, status: newStatus} : o));
        toast({ title: "Statut mis à jour", description: `La commande a été marquée comme "${newStatus}".` });
    } catch(error) {
        toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
    }
  };

  const getConsolidatedIngredients = (order: Order): ConsolidatedIngredients => {
    const ingredientMap: ConsolidatedIngredients = {};

    order.items.forEach(item => {
        const meal = catererMeals.find(m => m.id === item.mealId);
        if (meal) {
            meal.ingredients.forEach(ing => {
                const totalGrams = ing.grams * item.quantity;
                if(ingredientMap[ing.name]) {
                    ingredientMap[ing.name].grams += totalGrams;
                } else {
                    ingredientMap[ing.name] = { grams: totalGrams };
                }
            });
        }
    });

    return ingredientMap;
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">En attente</Badge>;
      case 'in_preparation': return <Badge className="bg-yellow-500 text-white hover:bg-yellow-500/90">En préparation</Badge>;
      case 'delivered': return <Badge className="bg-green-500 text-white hover:bg-green-500/90">Livrée</Badge>;
      case 'cancelled': return <Badge variant="destructive">Annulée</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };


  return (
    <>
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-destructive flex items-center gap-2">
          <ChefHat className="w-8 h-8" />
          Tableau de Bord Traiteur
        </h1>
      </header>

      <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-6 h-6" />
                  Créer un Repas avec l'IA
                </CardTitle>
                <CardDescription>
                  Décrivez le repas que vous souhaitez créer. L'IA se chargera de
                  générer une description, une liste d'ingrédients et les macros.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label
                    htmlFor="meal-description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nom ou description du repas
                  </label>
                  <Textarea
                    id="meal-description"
                    value={mealDescription}
                    onChange={(e) => setMealDescription(e.target.value)}
                    placeholder="Ex: Couscous au poulet"
                    disabled={isGenerating}
                  />
                </div>
                <Button onClick={handleGenerateMeal} disabled={isGenerating || !mealDescription} className="w-full md:w-auto bg-destructive hover:bg-destructive/90 text-white">
                  {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                  {isGenerating ? "Analyse en cours..." : "Générer le Repas avec l'IA"}
                </Button>
              </CardContent>
            </Card>

            {isGenerating && (
                <div className="text-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-destructive" />
                    <p className="mt-4 text-muted-foreground">L'IA analyse votre plat...</p>
                </div>
            )}

            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Résultat de l'Analyse IA</CardTitle>
                  <CardDescription>Vérifiez et modifiez les informations ci-dessous avant de sauvegarder le repas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nom du plat</Label>
                            <Input 
                                value={analysisResult.mealName}
                                onChange={(e) => setAnalysisResult({...analysisResult, mealName: e.target.value})}
                             />
                        </div>
                         <div className="space-y-2">
                            <Label>Catégorie</Label>
                             <Select onValueChange={(value: Meal['category']) => setCategory(value)} defaultValue={category}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir une catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="breakfast">Petit-déjeuner</SelectItem>
                                    <SelectItem value="lunch">Déjeuner</SelectItem>
                                    <SelectItem value="dinner">Dîner</SelectItem>
                                    <SelectItem value="snack">Collation</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                            value={analysisResult.description}
                            onChange={(e) => setAnalysisResult({...analysisResult, description: e.target.value})}
                            rows={3}
                        />
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label>Prix (DT)</Label>
                             <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="pl-10"/>
                             </div>
                         </div>
                        <div className="space-y-2">
                            <Label>Image du plat</Label>
                             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                             <Button variant="outline" className="w-full" onClick={handleImageUploadClick}>
                                <ImagePlus className="mr-2" />
                                Télécharger une image
                            </Button>
                            {mealImagePreview && (
                                <Image src={mealImagePreview} alt="Aperçu du plat" width={100} height={100} className="rounded-md object-cover mt-2" />
                            )}
                        </div>
                    </div>

                    <div>
                        <Label className="mb-2 block">Ingrédients Estimés</Label>
                         <div className="space-y-2">
                            {analysisResult.ingredients.map((ing, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input 
                                        value={ing.name} 
                                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                                        className="flex-1"
                                        placeholder="Nom de l'ingrédient"
                                    />
                                    <Input 
                                        type="number" 
                                        value={ing.grams}
                                        onChange={(e) => handleIngredientChange(index, 'grams', e.target.value)}
                                        className="w-24"
                                        placeholder="grammes"
                                    />
                                    <span className="text-sm text-muted-foreground">g</span>
                                    <Button variant="ghost" size="icon" onClick={() => removeIngredient(index)}>
                                        <Trash2 className="w-4 h-4 text-destructive"/>
                                    </Button>
                                </div>
                            ))}
                         </div>
                         <Button variant="outline" size="sm" onClick={addIngredient} className="mt-2">
                            <Plus className="w-4 h-4 mr-2"/> Ajouter un ingrédient
                         </Button>
                    </div>

                    <div>
                        <Label>Macros Totales (calculées)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                            <Card>
                                <CardHeader className="p-4">
                                    <CardDescription>Calories</CardDescription>
                                    <CardTitle>{analysisResult.totalMacros.calories} kcal</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="p-4">
                                    <CardDescription>Protéines</CardDescription>
                                    <CardTitle>{analysisResult.totalMacros.protein} g</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="p-4">
                                    <CardDescription>Glucides</CardDescription>
                                    <CardTitle>{analysisResult.totalMacros.carbs} g</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="p-4">
                                    <CardDescription>Lipides</CardDescription>
                                    <CardTitle>{analysisResult.totalMacros.fat} g</CardTitle>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                    
                    <Button onClick={handleSaveMeal} disabled={isSaving} className="w-full md:w-auto bg-destructive hover:bg-destructive/90 text-white">
                        {isSaving ? <Loader2 className="mr-2 animate-spin" /> : null}
                        Sauvegarder le repas
                    </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingBasket />
                    Commandes Reçues
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loadingOrders ? (
                             <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    <Loader2 className="mx-auto animate-spin text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : orders.length > 0 ? (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.clientName}</TableCell>
                                    <TableCell>{format(order.orderDate, 'd MMM yyyy', { locale: fr })}</TableCell>
                                    <TableCell>{order.totalPrice.toFixed(2)} DT</TableCell>
                                    <TableCell>
                                        <Select
                                          value={order.status}
                                          onValueChange={(value: Order['status']) => handleStatusChange(order.id, value)}
                                        >
                                          <SelectTrigger className="w-[180px] h-auto p-0 border-none focus:ring-0 focus:ring-offset-0">
                                            <SelectValue asChild>
                                                {getStatusBadge(order.status)}
                                            </SelectValue>
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pending">En attente</SelectItem>
                                            <SelectItem value="in_preparation">En préparation</SelectItem>
                                            <SelectItem value="delivered">Livrée</SelectItem>
                                            <SelectItem value="cancelled">Annulée</SelectItem>
                                          </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">Détails</Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-lg">
                                                <DialogHeader>
                                                    <DialogTitle>Détails de la commande de {order.clientName}</DialogTitle>
                                                    <DialogDescription>
                                                        Liste consolidée des ingrédients requis pour préparer cette commande.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                                    <div>
                                                        <h3 className="font-semibold mb-2">Repas commandés</h3>
                                                        <ul className="list-disc pl-5 text-sm">
                                                            {order.items.map(item => <li key={item.mealId}>{item.quantity} x {item.mealName}</li>)}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold mb-2 flex items-center gap-2"><ClipboardList/> Liste de courses</h3>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Ingrédient</TableHead>
                                                                    <TableHead className="text-right">Quantité requise</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {Object.entries(getConsolidatedIngredients(order)).map(([name, { grams }]) => (
                                                                    <TableRow key={name}>
                                                                        <TableCell>{name}</TableCell>
                                                                        <TableCell className="text-right font-medium">{grams} g</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    Aucune commande reçue pour le moment.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardHeader>
                <CardTitle>Vos repas créés</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Prix</TableHead>
                            <TableHead>Calories</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loadingMeals ? (
                             <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    <Loader2 className="mx-auto animate-spin text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : catererMeals.length > 0 ? (
                            catererMeals.map((meal) => (
                                <TableRow key={meal.id}>
                                    <TableCell>
                                        <Image src={meal.imageUrl} alt={meal.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint="caterer meal" />
                                    </TableCell>
                                    <TableCell className="font-medium">{meal.name}</TableCell>
                                    <TableCell>{meal.price.toFixed(2)} DT</TableCell>
                                    <TableCell>{meal.calories} kcal</TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog onOpenChange={(open) => { if (!open) setMealToDelete(null); }}>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => setMealToDelete(meal)}>
                                                    <Trash2 className="w-4 h-4 text-destructive"/>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce repas ?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                    Cette action est irréversible. Le repas "{meal.name}" sera définitivement supprimé.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDeleteMeal} className="bg-destructive hover:bg-destructive/90">
                                                        Supprimer
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    Aucun repas n'a encore été créé.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>
              </CardContent>
            </Card>
          </div>
    </div>
    </>
  );
}
