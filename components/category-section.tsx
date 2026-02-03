"use client"

import { MenuItemCard } from "./menu-item-card"
import type { Category, MenuItem } from "@/lib/types"

interface CategorySectionProps {
  category: Category
  items: MenuItem[]
}

export function CategorySection({ category, items }: CategorySectionProps) {
  if (items.length === 0) return null

  return (
    <section className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground">{category.name}</h2>
        {category.description && (
          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
