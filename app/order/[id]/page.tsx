import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Clock, ArrowLeft, Phone, User, CreditCard, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { QRCodeDisplay } from "@/components/qr-code"

export const dynamic = "force-dynamic"

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

async function getOrder(id: string): Promise<Order | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        menu_item:menu_items (id, name, price)
      )
    `)
    .eq("id", id)
    .single()

  if (error || !data) {
    return null
  }

  return data as Order
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "Order Placed", variant: "secondary" },
    confirmed: { label: "Confirmed", variant: "default" },
    preparing: { label: "Preparing", variant: "default" },
    ready: { label: "Ready for Pickup", variant: "default" },
    completed: { label: "Completed", variant: "outline" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  }

  const config = statusConfig[status] || { label: status, variant: "secondary" as const }

  return (
    <Badge variant={config.variant} className={status === "ready" ? "bg-accent text-accent-foreground" : ""}>
      {config.label}
    </Badge>
  )
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  const qrData = JSON.stringify({
    orderId: order.id,
    orderNumber: order.order_number,
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card">
        <div className="container flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Menu</span>
          </Link>
        </div>
      </header>

      <main className="container px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Order Placed Successfully!</h1>
            <p className="text-muted-foreground">Show this QR code at the counter to collect your order</p>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <QRCodeDisplay value={qrData} size={220} />
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="text-2xl font-bold text-primary font-mono">{order.order_number}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Order Status</CardTitle>
                {getStatusBadge(order.order_status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Placed on {new Date(order.created_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {item.quantity}x
                      </span>
                      <span className="font-medium">{item.menu_item.name}</span>
                    </div>
                    <span className="font-medium">₹{(item.unit_price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              
              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Special Instructions</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                </>
              )}

              <Separator />
              
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{order.total_amount.toFixed(0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Customer & Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{order.student_name}</span>
              </div>
              {order.student_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.student_phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                {order.payment_method === "gpay" ? (
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                )}
                <span>
                  {order.payment_method === "gpay" ? "GPay / UPI" : "Cash on Delivery"}
                  {" - "}
                  <Badge variant={order.payment_status === "paid" ? "default" : "secondary"} className="ml-1">
                    {order.payment_status === "paid" ? "Paid" : "Pending"}
                  </Badge>
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/">
              <Button variant="outline" size="lg">
                Order More Items
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
