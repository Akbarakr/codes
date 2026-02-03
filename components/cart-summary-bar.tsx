"use client"

import Link from "next/link"
import { ShoppingCart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"

export function CartSummaryBar() {
  const items = useCartStore((state) => state.items)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)
  const getTotalItems = useCartStore((state) => state.getTotalItems)

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card p-4 shadow-lg">
      <div className="container flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"}
            </p>
            <p className="text-sm text-muted-foreground">
              ₹{getTotalPrice().toFixed(0)}
            </p>
          </div>
        </div>
        <Link href="/cart">
          <Button className="bg-primary hover:bg-primary/90">
            View Cart
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
