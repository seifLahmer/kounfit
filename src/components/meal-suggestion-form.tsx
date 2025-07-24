
"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { runFlow } from "@genkit-ai/next/client"
import { motion } from "framer-motion"

import { generateMealSuggestions } from "@/ai/flows/generate-meal-suggestions"
import type { MealPlan } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  dietaryRequirements: z.string().min(2, "Please enter your dietary requirements."),
  preferences: z.string().min(2, "Please tell us your food preferences."),
  calorieGoal: z.coerce.number().min(1000, "Calorie goal must be at least 1000.").max(10000),
  macroRatio: z.string().regex(/^(\d+% protein, \d+% carbs, \d+% fat)$/i, "Please use format: X% protein, Y% carbs, Z% fat."),
})

export function MealSuggestionForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietaryRequirements: "Vegetarian",
      preferences: "Loves spicy food, prefers Mediterranean cuisine.",
      calorieGoal: 2000,
      macroRatio: "30% protein, 40% carbs, 30% fat",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setError(null)
    setMealPlan(null)

    try {
      const plan = await runFlow(generateMealSuggestions, values)
      setMealPlan(plan);
    } catch (e) {
      console.error(e)
      setError("Failed to generate meal suggestions. The AI might be busy, or the response was not in the correct format. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="dietaryRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Requirements</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Vegan, Gluten-Free" {...field} />
                      </FormControl>
                      <FormDescription>Any dietary restrictions you have.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="calorieGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Calorie Goal</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2200" {...field} />
                      </FormControl>
                      <FormDescription>Your target daily calorie intake.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="preferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Food Preferences & Dislikes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Likes Italian, dislikes cilantro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="macroRatio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Macronutrient Ratio</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 30% protein, 40% carbs, 30% fat" {...field} />
                    </FormControl>
                    <FormDescription>Desired ratio of protein, carbs, and fat.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Generating..." : "Generate Meals"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-8">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded-md w-1/2 animate-pulse"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-4 bg-muted rounded-md w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded-md w-3/4 animate-pulse"></div>
                <div className="h-4 bg-muted rounded-md w-1/2 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {mealPlan && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Your Personalized Meal Plan</h2>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {(Object.keys(mealPlan) as Array<keyof MealPlan>).map((mealKey, index) => (
              <motion.div
                key={mealKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="capitalize">{mealKey}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{mealPlan[mealKey].name}</h3>
                      <p className="text-muted-foreground text-sm mt-2 mb-4">
                        {mealPlan[mealKey].description}
                      </p>
                    </div>
                    <div className="space-y-2">
                       <Badge variant="outline">~{mealPlan[mealKey].calories} kcal</Badge>
                       <div className="text-xs text-muted-foreground space-x-2">
                        <span>P: {mealPlan[mealKey].macros.protein}</span>
                        <span>C: {mealPlan[mealKey].macros.carbs}</span>
                        <span>F: {mealPlan[mealKey].macros.fat}</span>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <Button variant="accent" className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">Save Meal Plan</Button>
        </div>
      )}
    </div>
  )
}
