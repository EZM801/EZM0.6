"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Home, Building, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Layout {
  id: string
  name: string
  instructions: string | null
  orientation: string
  rooms: Array<{
    id: string
    name: string
    description: string | null
  }>
}

const ORIENTATION_CONFIG = {
  ORIGIN: {
    icon: Home,
    label: 'Origin',
    color: 'bg-blue-100'
  },
  DESTINATION: {
    icon: Building,
    label: 'Destination',
    color: 'bg-green-100'
  }
} as const;

interface LayoutListProps {
  moveId: string
  layouts: Layout[]
}

export function LayoutList({ moveId, layouts }: LayoutListProps) {
  const router = useRouter()

  const handleDelete = async (layoutId: string) => {
    try {
      const response = await fetch(`/api/company/moves/${moveId}/layouts`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error("Failed to delete layout")
      }

      toast.success("Layout deleted successfully")
      router.refresh()
    } catch (error) {
      console.error("Error deleting layout:", error)
      toast.error("Failed to delete layout")
    }
  }

  if (!layouts || layouts.length === 0) {
    return (
      <Card className="border-none rounded-3xl soft-shadow">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-muted p-3">
            <Home className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No layouts yet</h3>
          <p className="mb-4 mt-2 text-center text-sm text-muted-foreground">
            You haven&apos;t created any layouts for this move yet.
          </p>
          <Button asChild className="rounded-full">
            <Link href={`/dashboard/company/moves/${moveId}/layouts/create`}>
              <Plus className="mr-2 h-4 w-4" /> Add Layout
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {layouts.map((layout) => {
        const orientationConfig = ORIENTATION_CONFIG[layout.orientation as keyof typeof ORIENTATION_CONFIG]
        const OrientationIcon = orientationConfig?.icon || Home
        
        return (
          <Card
            key={layout.id}
            className="border-none rounded-3xl soft-shadow hover:shadow-lg transition-all duration-200"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{layout.name}</CardTitle>
                <Badge
                  variant="secondary"
                  className={`flex items-center gap-1 ${orientationConfig?.color || 'bg-gray-100'}`}
                >
                  <OrientationIcon className="h-3 w-3" />
                  {orientationConfig?.label || layout.orientation}
                </Badge>
              </div>
              {layout.instructions && (
                <CardDescription className="line-clamp-2">
                  {layout.instructions}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {layout.rooms.length} rooms
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {layout.rooms.slice(0, 3).map((room) => (
                      <Badge
                        key={room.id}
                        variant="outline"
                        className="bg-slate-50"
                      >
                        {room.name}
                      </Badge>
                    ))}
                    {layout.rooms.length > 3 && (
                      <Badge variant="outline" className="bg-slate-50">
                        +{layout.rooms.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:text-destructive"
                    onClick={() => handleDelete(layout.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    asChild
                  >
                    <Link href={`/dashboard/company/moves/${moveId}/layouts/${layout.id}`}>
                      View Layout
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 