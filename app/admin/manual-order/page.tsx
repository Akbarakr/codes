"use client"

import { useState, useEffect } from "react"
import { Plus, Minus, Trash2, CreditCard, Banknote, Printer, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { BillPrint } from "@/components/admin/bill-print"
import type { Category, MenuItem } from "@/lib/types"

interface CartItem {
  menuItem: MenuItem
  quantity: number
}

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  menu_item: {
    id: string
    name: string
    price: number
  }
}

interface Order {
  id: string
  order_number: string
  student_name: string
  student_phone: string | null
  payment_method: "gpay" | "cod"
  payment_status: "pending" | "paid"
  order_status: string
  total_amount: number
  notes: string | null
  created_at: string
  order_items: OrderItem[]
}

export default function ManualOrderPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"gpay" | "cod">("cod")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [showBill, setShowBill] = useState(false)

  useEffect(() => {
    fetchMenuData()
  }, [])

  const fetchMenuData = async () => {
    try {
      const response = await fetch("/api/menu-items")
      if (response.ok) {
        const items = await response.json()
        setMenuItems(items.filter((item: MenuItem) => item.is_available))
        
        // Extract unique categories
        const uniqueCategories = new Map<string, Category>()
        items.forEach((item: MenuItem & { category: Category }) => {
          if (item.category && !uniqueCategories.has(item.category.id)) {
            uniqueCategories.set(item.category.id, item.category)
          }
        })
        setCategories(Array.from(uniqueCategories.values()).sort((a, b) => a.sort_order - b.sort_order))
      }
    } catch (error) {
      console.error("Error fetching menu:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = (menuItem: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuItem.id === menuItem.id)
      if (existing) {
        return prev.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { menuItem, quantity: 1 }]
    })
  }

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.menuItem.id !== menuItemId))
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.menuItem.id === menuItemId ? { ...item, quantity } : item
        )
      )
    }
  }

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((item) => item.menuItem.id !== menuItemId))
  }

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0 || !customerName.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: customerName.trim(),
          studentPhone: null,
          paymentMethod,
          notes: "Walk-in order",
          items: cart.map((item) => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
            unitPrice: item.menuItem.price,
          })),
        }),
      })

      if (response.ok) {
        const order = await response.json()
        
        // Fetch complete order with items for bill
        const orderResponse = await fetch(`/api/orders/${order.id}`)
        if (orderResponse.ok) {
          const fullOrder = await orderResponse.json()
          setCreatedOrder(fullOrder)
        }
      }
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Failed to create order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrintBill = () => {
    setShowBill(true)
    setTimeout(() => {
      window.print()
    }, 100)
  }

  const handleNewOrder = () => {
    setCart([])
    setCustomerName("")
    setPaymentMethod("cod")
    setCreatedOrder(null)
    setShowBill(false)
  }

  const markAsPaid = async () => {
    if (!createdOrder) return
    try {
      const response = await fetch(`/api/orders/${createdOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: "paid", order_status: "completed" }),
      })
      if (response.ok) {
        setCreatedOrder({ ...createdOrder, payment_status: "paid", order_status: "completed" })
      }
    } catch (error) {
      console.error("Error marking as paid:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading menu...</p>
      </div>
    )
  }

  // Order created success screen
  if (createdOrder) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">Order Created!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center bg-secondary rounded-lg py-4">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-3xl font-bold font-mono text-primary">{createdOrder.order_number}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium">{createdOrder.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">{createdOrder.payment_method === "gpay" ? "UPI" : "Cash"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge variant={createdOrder.payment_status === "paid" ? "default" : "secondary"}>
                  {createdOrder.payment_status === "paid" ? "Paid" : "Pending"}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Items</h4>
              {createdOrder.order_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.menu_item.name}</span>
                  <span>₹{(item.unit_price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">₹{createdOrder.total_amount.toFixed(0)}</span>
            </div>

            <div className="flex gap-3">
              {createdOrder.payment_status !== "paid" && (
                <Button onClick={markAsPaid} className="flex-1 bg-accent hover:bg-accent/90">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>
              )}
              <Button onClick={handlePrintBill} variant="outline" className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Print Bill
              </Button>
            </div>

            <Button onClick={handleNewOrder} variant="outline" className="w-full">
              Create New Order
            </Button>
          </CardContent>
        </Card>

        {showBill && <BillPrint order={createdOrder} />}
      </div>
    )
  }

  const itemsByCategory = categories.map((category) => ({
    category,
    items: menuItems.filter((item) => item.category_id === category.id),
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Manual Order (Walk-in)</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Menu Items */}
        <div className="lg:col-span-2 space-y-6">
          {itemsByCategory.map(({ category, items }) => (
            items.length > 0 && (
              <Card key={category.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {items.map((item) => {
                      const cartItem = cart.find((ci) => ci.menuItem.id === item.id)
                      const quantity = cartItem?.quantity || 0

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-sm text-primary font-semibold">₹{item.price.toFixed(0)}</p>
                          </div>
                          {quantity > 0 ? (
                            <div className="flex items-center gap-1 bg-primary/10 rounded-full p-1">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-full"
                                onClick={() => updateQuantity(item.id, quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-full"
                                onClick={() => addToCart(item)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => addToCart(item)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Add items to the order
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.menuItem.id} className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.menuItem.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ₹{item.menuItem.price.toFixed(0)} x {item.quantity}
                          </p>
                        </div>
                        <span className="font-medium text-sm">
                          ₹{(item.menuItem.price * item.quantity).toFixed(0)}
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.menuItem.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-primary">₹{getTotalPrice().toFixed(0)}</span>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as "gpay" | "cod")}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-secondary/50">
                      <RadioGroupItem value="cod" id="manual-cod" />
                      <Label htmlFor="manual-cod" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Banknote className="h-4 w-4 text-accent" />
                        <span>Cash</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-secondary/50">
                      <RadioGroupItem value="gpay" id="manual-gpay" />
                      <Label htmlFor="manual-gpay" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <span>GPay / UPI</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={cart.length === 0 || !customerName.trim() || isSubmitting}
                >
                  {isSubmitting ? "Creating Order..." : `Create Order - ₹${getTotalPrice().toFixed(0)}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
