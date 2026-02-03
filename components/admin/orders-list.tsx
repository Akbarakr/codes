"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  menu_item: {
    id: string
    name: string
  }
}

interface Order {
  id: string
  order_number: string
  student_name: string
  payment_method: "gpay" | "cod"
  payment_status: "pending" | "paid"
  order_status: string
  total_amount: number
  created_at: string
  order_items: OrderItem[]
}

interface OrdersListProps {
  initialOrders: Order[]
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

const paymentStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
]

function getStatusBadgeStyle(status: string) {
  switch (status) {
    case "pending":
      return "bg-secondary text-secondary-foreground"
    case "confirmed":
      return "bg-blue-100 text-blue-800"
    case "preparing":
      return "bg-yellow-100 text-yellow-800"
    case "ready":
      return "bg-accent text-accent-foreground"
    case "completed":
      return "bg-muted text-muted-foreground"
    case "cancelled":
      return "bg-destructive/10 text-destructive"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

export function OrdersList({ initialOrders }: OrdersListProps) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [updating, setUpdating] = useState<string | null>(null)

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdating(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: status }),
      })

      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, order_status: status } : order
          )
        )
      }
    } catch (error) {
      console.error("Error updating order:", error)
    } finally {
      setUpdating(null)
    }
  }

  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    setUpdating(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: paymentStatus }),
      })

      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? { ...order, payment_status: paymentStatus as "pending" | "paid" }
              : order
          )
        )
      }
    } catch (error) {
      console.error("Error updating payment:", error)
    } finally {
      setUpdating(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No orders yet
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono font-medium">
                {order.order_number}
              </TableCell>
              <TableCell>{order.student_name}</TableCell>
              <TableCell className="max-w-[200px]">
                <span className="text-sm text-muted-foreground truncate block">
                  {order.order_items
                    .map((item) => `${item.quantity}x ${item.menu_item.name}`)
                    .join(", ")}
                </span>
              </TableCell>
              <TableCell className="font-medium">₹{order.total_amount.toFixed(0)}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="text-xs w-fit">
                    {order.payment_method === "gpay" ? "UPI" : "Cash"}
                  </Badge>
                  <Select
                    value={order.payment_status}
                    onValueChange={(value) => updatePaymentStatus(order.id, value)}
                    disabled={updating === order.id}
                  >
                    <SelectTrigger className="h-7 text-xs w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
              <TableCell>
                <Select
                  value={order.order_status}
                  onValueChange={(value) => updateOrderStatus(order.id, value)}
                  disabled={updating === order.id}
                >
                  <SelectTrigger className="h-8 w-32">
                    <Badge className={getStatusBadgeStyle(order.order_status)}>
                      {statusOptions.find((s) => s.value === order.order_status)?.label ||
                        order.order_status}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
