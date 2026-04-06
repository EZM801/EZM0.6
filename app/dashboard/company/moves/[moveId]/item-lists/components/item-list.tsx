"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Box, Plus, Package, Truck, Home } from "lucide-react"
import { toast } from "sonner"

interface ItemList {
  id: string
  name: string
  description: string | null
  items: Array<{
    id: string
    name: string
    packingStatus: string
  }>
}

const STATUS_CONFIG = {
  UNPACKED: {
    icon: Package,
    label: 'Unpacked',
    color: 'bg-slate-100'
  },
  PACKED: {
    icon: Box,
    label: 'Packed',
    color: 'bg-blue-100'
  },
  LOADED: {
    icon: Truck,
    label: 'Loaded',
    color: 'bg-yellow-100'
  },
  UNLOADED: {
    icon: Box,
    label: 'Unloaded',
    color: 'bg-purple-100'
  },
  UNPACKED_AT_DESTINATION: {
    icon: Home,
    label: 'At Destination',
    color: 'bg-green-100'
  }
} as const;

interface ItemListProps {
  moveId: string
  itemLists: ItemList[]
}

export function ItemList({ moveId, itemLists }: ItemListProps) {
  const router = useRouter()

  const calculateProgress = (items: ItemList['items']) => {
    if (items.length === 0) return 0
    const completedItems = items.filter(item => 
      item.packingStatus === 'PACKED' || 
      item.packingStatus === 'LOADED' || 
      item.packingStatus === 'UNLOADED' ||
      item.packingStatus === 'UNPACKED_AT_DESTINATION'
    ).length
    return Math.round((completedItems / items.length) * 100)
  }

  const handleDelete = async (itemListId: string) => {
    try {
      const response = await fetch(`/api/company-moves/${moveId}/item-lists/${itemListId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error("Failed to delete item list")
      }

      toast.success("Item list deleted successfully")
      router.refresh()
    } catch (error) {
      console.error("Error deleting item list:", error)
      toast.error("Failed to delete item list")
    }
  }

  if (!itemLists || itemLists.length === 0) {
    return (
      <Card className="border-none rounded-3xl soft-shadow">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-muted p-3">
            <Box className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No item lists yet</h3>
          <p className="mb-4 mt-2 text-center text-sm text-muted-foreground">
            You haven&apos;t created any item lists for this move yet.
          </p>
          <Button asChild className="rounded-full">
            <Link href={`/dashboard/company/moves/${moveId}/item-lists/create`}>
              <Plus className="mr-2 h-4 w-4" /> Add Item List
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {itemLists.map((list) => (
        <Card
          key={list.id}
          className="border-none rounded-3xl soft-shadow hover:shadow-lg transition-all duration-200"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{list.name}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => handleDelete(list.id)}
              >
                <Box className="h-4 w-4" />
              </Button>
            </div>
            {list.description && (
              <CardDescription className="line-clamp-2">
                {list.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {calculateProgress(list.items)}% Complete
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {list.items.length} items
                  </span>
                </div>
                <Progress value={calculateProgress(list.items)} className="mb-4" />
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                  const count = list.items.filter(item => item.packingStatus === status).length
                  if (count === 0) return null
                  return (
                    <Badge
                      key={status}
                      variant="secondary"
                      className={`flex items-center gap-1 ${config.color}`}
                    >
                      <config.icon className="h-3 w-3" />
                      {count}
                    </Badge>
                  )
                })}
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="rounded-full"
                  asChild
                >
                  <Link href={`/dashboard/company/moves/${moveId}/item-lists/${list.id}`}>
                    View Items
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 