import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  List,
  Box,
  Truck,
  Calendar,
  Settings,
} from 'lucide-react'

interface MoveNavigationProps {
  moveId: string
}

export function MoveNavigation({ moveId }: MoveNavigationProps) {
  const pathname = usePathname()

  const links = [
    {
      href: `/dashboard/move/${moveId}`,
      label: 'Overview',
      icon: Home,
    },
    {
      href: `/dashboard/move/${moveId}/item-lists`,
      label: 'Item Lists',
      icon: List,
    },
    {
      href: `/dashboard/move/${moveId}/inventory`,
      label: 'Inventory',
      icon: Box,
    },
    {
      href: `/dashboard/move/${moveId}/logistics`,
      label: 'Logistics',
      icon: Truck,
    },
    {
      href: `/dashboard/move/${moveId}/schedule`,
      label: 'Schedule',
      icon: Calendar,
    },
    {
      href: `/dashboard/move/${moveId}/settings`,
      label: 'Settings',
      icon: Settings,
    },
  ]

  return (
    <nav className="flex items-center gap-1 px-2 border-b">
      {links.map((link) => {
        const Icon = link.icon
        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:text-primary',
              isActive
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="w-4 h-4" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
} 