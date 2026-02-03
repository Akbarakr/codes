"use client"

import { useState, useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Camera, CameraOff, Search, Printer, CheckCircle, User, Phone, Clock } from "lucide-react"
import { BillPrint } from "@/components/admin/bill-print"

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

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
]

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [manualOrderNumber, setManualOrderNumber] = useState("")
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showBill, setShowBill] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader")
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          await html5QrCode.stop()
          setIsScanning(false)
          handleQrData(decodedText)
        },
        () => {}
      )
      setIsScanning(true)
      setError(null)
    } catch (err) {
      console.error("Error starting scanner:", err)
      setError("Could not access camera. Please allow camera permissions.")
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop()
      setIsScanning(false)
    }
  }

  const handleQrData = async (data: string) => {
    try {
      const parsed = JSON.parse(data)
      if (parsed.orderId) {
        await fetchOrder(parsed.orderId)
      }
    } catch {
      setError("Invalid QR code format")
    }
  }

  const fetchOrder = async (orderId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else {
        setError("Order not found")
        setOrder(null)
      }
    } catch {
      setError("Failed to fetch order")
      setOrder(null)
    } finally {
      setIsLoading(false)
    }
  }

  const searchByOrderNumber = async () => {
    if (!manualOrderNumber.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/orders/search?orderNumber=${encodeURIComponent(manualOrderNumber.trim())}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
        setManualOrderNumber("")
      } else {
        setError("Order not found")
        setOrder(null)
      }
    } catch {
      setError("Failed to search order")
      setOrder(null)
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (status: string) => {
    if (!order) return
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: status }),
      })
      if (response.ok) {
        setOrder({ ...order, order_status: status })
      }
    } catch (err) {
      console.error("Error updating status:", err)
    }
  }

  const updatePaymentStatus = async (paymentStatus: string) => {
    if (!order) return
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: paymentStatus }),
      })
      if (response.ok) {
        setOrder({ ...order, payment_status: paymentStatus as "pending" | "paid" })
      }
    } catch (err) {
      console.error("Error updating payment:", err)
    }
  }

  const handlePrint = () => {
    setShowBill(true)
    setTimeout(() => {
      window.print()
    }, 100)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Order Scanner</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Scan QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                id="qr-reader"
                className={`w-full aspect-square rounded-lg overflow-hidden bg-muted ${
                  isScanning ? "" : "hidden"
                }`}
              />
              {!isScanning && (
                <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Camera not active</p>
                  </div>
                </div>
              )}
              <div className="mt-4">
                {isScanning ? (
                  <Button onClick={stopScanning} variant="outline" className="w-full">
                    <CameraOff className="h-4 w-4 mr-2" />
                    Stop Scanning
                  </Button>
                ) : (
                  <Button onClick={startScanning} className="w-full bg-primary hover:bg-primary/90">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Scanning
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search by Order Number
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter order number (e.g., ORD-XXX)"
                  value={manualOrderNumber}
                  onChange={(e) => setManualOrderNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchByOrderNumber()}
                />
                <Button onClick={searchByOrderNumber} disabled={isLoading}>
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive text-center">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          {order ? (
            <Card className="print:hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Order Details</CardTitle>
                  <Badge
                    className={
                      order.order_status === "ready"
                        ? "bg-accent text-accent-foreground"
                        : order.order_status === "completed"
                        ? "bg-muted text-muted-foreground"
                        : ""
                    }
                  >
                    {statusOptions.find((s) => s.value === order.order_status)?.label || order.order_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-2 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="text-2xl font-bold font-mono text-primary">{order.order_number}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{order.student_name}</span>
                  </div>
                  {order.student_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.student_phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Items</h4>
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.menu_item.name}
                      </span>
                      <span>₹{(item.unit_price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Notes:</p>
                      <p className="text-sm">{order.notes}</p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{order.total_amount.toFixed(0)}</span>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Payment ({order.payment_method === "gpay" ? "UPI" : "Cash"})</Label>
                    <Select
                      value={order.payment_status}
                      onValueChange={updatePaymentStatus}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Order Status</Label>
                    <Select
                      value={order.order_status}
                      onValueChange={updateOrderStatus}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => updateOrderStatus("completed")}
                    className="flex-1 bg-accent hover:bg-accent/90"
                    disabled={order.order_status === "completed"}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Order
                  </Button>
                  <Button onClick={handlePrint} variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Bill
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Scan a QR code or search by order number</p>
                  <p className="text-sm mt-1">to view order details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showBill && order && <BillPrint order={order} />}
    </div>
  )
}
