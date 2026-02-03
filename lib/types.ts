export interface Category {
  id: string
  name: string
  description: string | null
  sort_order: number
  created_at: string
}

export interface MenuItem {
  id: string
  category_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  prep_time_minutes: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  created_at: string
  menu_item?: MenuItem
}

export interface Order {
  id: string
  order_number: string
  student_name: string
  student_phone: string | null
  payment_method: 'gpay' | 'cod'
  payment_status: 'pending' | 'paid'
  order_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  total_amount: number
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'staff'
  created_at: string
}
