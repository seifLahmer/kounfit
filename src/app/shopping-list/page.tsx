
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Trash2, Loader2 } from "lucide-react"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

const initialCartItem = {
  id: 1,
  name: "Simple Tomato Side",
  weight: "200g",
  price: 40.0,
  quantity: 2,
  image: "https://placehold.co/120x100.png",
}

export default function ShoppingCartPage() {
  const [cartItem, setCartItem] = useState(initialCartItem)
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/welcome")
      } else {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [router])

  const handleQuantityChange = (amount: number) => {
    setCartItem((prev) => ({
      ...prev,
      quantity: Math.max(0, prev.quantity + amount),
    }))
  }

  const subtotal = cartItem.price * cartItem.quantity
  const tax = subtotal * 0.08
  const total = subtotal + tax

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <header className="p-4 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-red-500" />
          <h1 className="text-2xl font-bold text-red-500">Votre Panier</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <Card>
            <CardContent className="p-4 flex gap-4">
              <Image
                src={cartItem.image}
                alt={cartItem.name}
                width={120}
                height={100}
                className="rounded-lg object-cover"
                data-ai-hint="tomato side dish"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{`${cartItem.name} (${cartItem.weight})`}</h2>
                  <p className="text-red-500 font-bold mt-1">{cartItem.price.toFixed(2)} DT</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-7 h-7 rounded-full"
                      onClick={() => handleQuantityChange(-1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-bold">{cartItem.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-7 h-7 rounded-full"
                      onClick={() => handleQuantityChange(1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <h2 className="text-lg font-bold">Résumé de la commande</h2>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxe estimée (8%)</span>
                  <span>{tax.toFixed(2)} DT</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>{total.toFixed(2)} DT</span>
              </div>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg h-12">
                Passer la commande
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

    