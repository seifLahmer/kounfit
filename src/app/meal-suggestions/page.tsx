import { MainLayout } from "@/components/main-layout"
import { MealSuggestionForm } from "@/components/meal-suggestion-form"
import { Bot } from "lucide-react"

export default function MealSuggestionsPage() {
  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <header className="bg-card p-4 border-b">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6" />
            AI Meal Suggestions
          </h1>
          <p className="text-muted-foreground mt-1">
            Let our AI chef cook up some personalized meal ideas based on your goals.
          </p>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <MealSuggestionForm />
        </div>
      </div>
    </MainLayout>
  )
}
