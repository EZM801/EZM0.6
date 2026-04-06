"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface NavItem {
  title: string
  href: string
  icon: keyof typeof Icons
}

interface DashboardNavProps {
  items: NavItem[]
}

export function DashboardNav({ items }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {items.map((item) => {
        const Icon = Icons[item.icon]
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
} 