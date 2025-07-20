import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Printer, ShoppingCart } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const shoppingListData = {
  produce: [
    { id: "prod1", name: "Spinach", quantity: "2 cups" },
    { id: "prod2", name: "Avocado", quantity: "2 medium" },
    { id: "prod3", name: "Tomatoes", quantity: "1 pint" },
    { id: "prod4", name: "Onion", quantity: "1 large" },
    { id: "prod5", name: "Garlic", quantity: "3 cloves" },
    { id: "prod6", name: "Lemon", quantity: "1" },
  ],
  protein: [
    { id: "prot1", name: "Chicken Breast", quantity: "2 lbs" },
    { id: "prot2", name: "Salmon Fillet", quantity: "1 lb" },
    { id: "prot3", name: "Eggs", quantity: "1 dozen" },
    { id: "prot4", name: "Tofu (firm)", quantity: "1 block" },
  ],
  pantry: [
    { id: "pant1", name: "Quinoa", quantity: "1 cup" },
    { id: "pant2", name: "Olive Oil", quantity: "1 bottle" },
    { id: "pant3", name: "Balsamic Vinegar", quantity: "1 bottle" },
    { id: "pant4", name: "Almonds", quantity: "1/2 cup" },
  ],
  dairy: [
    { id: "dair1", name: "Greek Yogurt", quantity: "1 container" },
    { id: "dair2", name: "Feta Cheese", quantity: "1 block" },
  ],
}

type Ingredient = { id: string; name: string; quantity: string }
type Category = keyof typeof shoppingListData

const CategoryTitle: Record<Category, string> = {
  produce: "Produce",
  protein: "Protein",
  pantry: "Pantry & Grains",
  dairy: "Dairy & Alternatives",
}

export default function ShoppingListPage() {
  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ShoppingCart />
              Shopping List
            </h2>
            <p className="text-muted-foreground">
              Ingredients for your selected meal plan: "Mediterranean Delight"
            </p>
          </div>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print List
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-8">
              {(Object.keys(shoppingListData) as Category[]).map(
                (category) => (
                  <div key={category}>
                    <h3 className="text-xl font-semibold tracking-tight mb-4">
                      {CategoryTitle[category]}
                    </h3>
                    <div className="space-y-4">
                      {shoppingListData[category].map(
                        (item: Ingredient) => (
                          <div key={item.id} className="flex items-center space-x-3">
                            <Checkbox id={item.id} />
                            <div className="grid gap-1.5 leading-none">
                              <Label htmlFor={item.id} className="text-base font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {item.name}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                    <Separator className="mt-6" />
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
