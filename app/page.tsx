import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { CategorySection } from "@/components/category-section"
import { CartSummaryBar } from "@/components/cart-summary-bar"
import type { Category, MenuItem } from "@/lib/types"

export const dynamic = "force-dynamic"

async function getMenuData() {
  const supabase = await createClient()
  
  const [categoriesResult, itemsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("menu_items")
      .select("*")
      .order("name", { ascending: true }),
  ])

  return {
    categories: (categoriesResult.data || []) as Category[],
    menuItems: (itemsResult.data || []) as MenuItem[],
  }
}

export default async function MenuPage() {
  const { categories, menuItems } = await getMenuData()

  const itemsByCategory = categories.map((category) => ({
    category,
    items: menuItems.filter((item) => item.category_id === category.id),
  }))

  const availableCount = menuItems.filter((item) => item.is_available).length
  const totalCount = menuItems.length

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Today&apos;s Menu</h1>
          <p className="text-muted-foreground mt-1">
            {availableCount} of {totalCount} items available
          </p>
        </div>

        {itemsByCategory.map(({ category, items }) => (
          <CategorySection key={category.id} category={category} items={items} />
        ))}

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No menu items available at the moment.</p>
          </div>
        )}
      </main>

      <CartSummaryBar />
    </div>
  )
}
