"use client"

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

interface BillPrintProps {
  order: Order
}

export function BillPrint({ order }: BillPrintProps) {
  return (
    <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:p-4">
      <div className="max-w-sm mx-auto font-mono text-sm">
        <div className="text-center border-b-2 border-dashed border-black pb-4 mb-4">
          <h1 className="text-xl font-bold">CAMPUS CANTEEN</h1>
          <p className="text-xs mt-1">Your College Name</p>
          <p className="text-xs">Phone: 1234567890</p>
        </div>

        <div className="border-b border-dashed border-black pb-4 mb-4">
          <div className="flex justify-between">
            <span>Order #:</span>
            <span className="font-bold">{order.order_number}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span>
              {new Date(order.created_at).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{order.student_name}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment:</span>
            <span>
              {order.payment_method === "gpay" ? "UPI" : "Cash"} -{" "}
              {order.payment_status === "paid" ? "PAID" : "PENDING"}
            </span>
          </div>
        </div>

        <table className="w-full border-b border-dashed border-black pb-4 mb-4">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left py-1">Item</th>
              <th className="text-center py-1">Qty</th>
              <th className="text-right py-1">Price</th>
              <th className="text-right py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => (
              <tr key={item.id}>
                <td className="py-1">{item.menu_item.name}</td>
                <td className="text-center py-1">{item.quantity}</td>
                <td className="text-right py-1">₹{item.unit_price.toFixed(0)}</td>
                <td className="text-right py-1">
                  ₹{(item.unit_price * item.quantity).toFixed(0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-b-2 border-dashed border-black pb-4 mb-4">
          <div className="flex justify-between text-lg font-bold">
            <span>TOTAL:</span>
            <span>₹{order.total_amount.toFixed(0)}</span>
          </div>
        </div>

        {order.notes && (
          <div className="border-b border-dashed border-black pb-4 mb-4">
            <p className="font-bold">Notes:</p>
            <p>{order.notes}</p>
          </div>
        )}

        <div className="text-center text-xs">
          <p className="font-bold mb-2">Thank You!</p>
          <p>Visit Again</p>
          <p className="mt-4">--- End of Bill ---</p>
        </div>
      </div>
    </div>
  )
}
