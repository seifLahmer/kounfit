
"use client"

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, Share2, Clock, Star, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// This is mock data. In a real app, you would fetch this based on the `id` param.
const mealData = {
  id: "1",
  name: "Escalope Grillée",
  price: 25.00,
  discount: 10,
  image: "https://placehold.co/600x400.png",
  description: "Tendres escalopes de poulet grillées à la perfection, servies avec une garniture de légumes frais. Un plat sain, riche en protéines et délicieux pour un repas équilibré.",
  rating: 4.8,
  prepTime: 20,
  calories: 600,
  macros: {
    protein: 45,
    carbs: 30,
    fat: 20
  }
};

export default function MealDetailPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <Link href="/home" passHref>
          <Button variant="ghost" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm">
            <ChevronLeft />
          </Button>
        </Link>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm">
          <Share2 />
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="relative h-80">
          <Image
            src={mealData.image}
            alt={mealData.name}
            layout="fill"
            objectFit="cover"
            className="rounded-b-3xl"
            data-ai-hint="grilled chicken dish"
          />
        </div>

        <div className="p-6 space-y-4">
          <h1 className="text-3xl font-bold">{mealData.name}</h1>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-destructive">{mealData.price.toFixed(2)} DT</p>
              {mealData.discount > 0 && (
                <Badge variant="destructive" className="ml-2">-{mealData.discount}%</Badge>
              )}
            </div>
          </div>
          
           <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                  <Badge variant="secondary">Livré</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{mealData.prepTime} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>{mealData.rating}</span>
              </div>
            </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{mealData.description}</p>
          </div>
          
          <div>
             <h2 className="text-xl font-semibold mb-2">Valeurs Nutritionnelles</h2>
             <div className="flex justify-around bg-muted p-4 rounded-lg">
                <div className="text-center">
                    <p className="font-bold text-lg">{mealData.calories}</p>
                    <p className="text-sm text-muted-foreground">Kcal</p>
                </div>
                <div className="text-center">
                    <p className="font-bold text-lg">{mealData.macros.protein}g</p>
                    <p className="text-sm text-muted-foreground">Protéines</p>
                </div>
                 <div className="text-center">
                    <p className="font-bold text-lg">{mealData.macros.carbs}g</p>
                    <p className="text-sm text-muted-foreground">Glucides</p>
                </div>
                 <div className="text-center">
                    <p className="font-bold text-lg">{mealData.macros.fat}g</p>
                    <p className="text-sm text-muted-foreground">Lipides</p>
                </div>
             </div>
          </div>

        </div>
      </main>

      <footer className="p-4 border-t bg-background">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} className="rounded-full">
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)} className="rounded-full">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
          <Button size="lg" className="w-1/2 bg-destructive hover:bg-destructive/90 rounded-full">
            Ajouter au panier
          </Button>
        </div>
      </footer>
    </div>
  );
}
