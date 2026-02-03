import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Clock, CheckCircle, IndianRupee } from "lucide-react"
import { OrdersList } from "@/components/admin/orders-list"

export const dynamic = "force-dynamic"

async function getDashboardStats() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [ordersResult, pendingResult, completedResult] = await Promise.all([
    supabase
      .from("orders")
      .select("total_amount")
      .gte("created_at", today.toISOString()),
    supabase
      .from("orders")
      .select("id", { count: "exact" })
      .in("order_status", ["pending", "confirmed", "preparing", "ready"]),
    supabase
      .from("orders")
      .select("id", { count: "exact" })
      .eq("order_status", "completed")
      .gte("created_at", today.toISOString()),
  ])

  const todayOrders = ordersResult.data || []
  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)

  return {
    todayOrderCount: todayOrders.length,
    todayRevenue,
    pendingCount: pendingResult.count || 0,
    completedCount: completedResult.count || 0,
  }
}

async function getRecentOrders() {
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
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }

  return data
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()
  const orders = await getRecentOrders()

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrderCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Revenue
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{stats.todayRevenue.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Orders
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Today
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.completedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersList initialOrders={orders} />
        </CardContent>
      </Card>
    </div>
  )
}
