import { createClient } from "@/lib/supabase/server"
import { MenuManagement } from "@/components/admin/menu-management"
import type { Category, MenuItem } from "@/lib/types"

export const dynamic = "force-dynamic"

async function getMenuData() {
  const supabase = await createClient()

  const [categoriesResult, itemsResult] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("menu_items").select("*").order("name", { ascending: true }),
  ])

  return {
    categories: (categoriesResult.data || []) as Category[],
    menuItems: (itemsResult.data || []) as MenuItem[],
  }
}

export default async function MenuPage() {
  const { categories, menuItems } = await getMenuData()

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Menu Management</h1>
      <MenuManagement initialCategories={categories} initialMenuItems={menuItems} />
    </div>
  )
}
