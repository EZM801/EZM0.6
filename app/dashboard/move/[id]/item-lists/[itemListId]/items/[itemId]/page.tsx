"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Package, PackageCheck, Truck, Home, Image as ImageIcon, QrCode } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouteParams } from "@/app/hooks/useRouteParams"
import { useItem } from "@/app/hooks/useItem"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

const PACKING_STATUS = {
  unpacked: {
    label: "Unpacked",
    icon: Package,
    color: "bg-gray-100 text-gray-800",
  },
  packed: {
    label: "Packed",
    icon: PackageCheck,
    color: "bg-blue-100 text-blue-800",
  },
  in_transit: {
    label: "In Transit",
    icon: Truck,
    color: "bg-yellow-100 text-yellow-800",
  },
  unpacked_at_destination: {
    label: "Unpacked at Destination",
    icon: Home,
    color: "bg-green-100 text-green-800",
  },
} as const

interface RouteParams {
  id: string
  itemListId: string
  itemId: string
}

export default function ItemPage() {
  const router = useRouter()
  const params = useRouteParams<RouteParams>()
  const moveId = params.id
  const itemListId = params.itemListId
  const itemId = params.itemId
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const { data: item, isLoading, error, refetch } = useItem(moveId, itemListId, itemId)

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdatingStatus(newStatus)
      const response = await fetch(`/api/moves/${moveId}/item-lists/${itemListId}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packingStatus: newStatus
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update item status')
      }

      toast.success('Item status updated successfully')
      refetch()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to update item status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 rounded-full">
            <Link href={`/dashboard/move/${moveId}/item-lists/${itemListId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Item List
            </Link>
          </Button>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Card className="mx-auto max-w-2xl border-none rounded-3xl soft-shadow">
          <CardContent className="p-6">
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 rounded-full">
            <Link href={`/dashboard/move/${moveId}/item-lists/${itemListId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Item List
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Error</h1>
          <p className="text-destructive">Failed to load item. Please try again.</p>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 rounded-full">
            <Link href={`/dashboard/move/${moveId}/item-lists/${itemListId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Item List
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Not Found</h1>
          <p className="text-muted-foreground">The requested item could not be found.</p>
        </div>
      </div>
    )
  }

  const currentStatus = item.packingStatus || 'unpacked'
  const StatusIcon = PACKING_STATUS[currentStatus as keyof typeof PACKING_STATUS].icon
  const statusColor = PACKING_STATUS[currentStatus as keyof typeof PACKING_STATUS].color

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 rounded-full">
          <Link href={`/dashboard/move/${moveId}/item-lists/${itemListId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Item List
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">{item.name}</h1>
            <p className="text-muted-foreground">{item.description}</p>
          </div>
          <Button variant="outline" asChild className="rounded-full">
            <Link href={`/dashboard/move/${moveId}/item-lists/${itemListId}/items/${itemId}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Item
            </Link>
          </Button>
        </div>
      </div>

      <Card className="mx-auto max-w-2xl border-none rounded-3xl soft-shadow">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {item.image ? (
                <div className="relative h-32 w-32 rounded-lg overflow-hidden">
                  <Image
                    src={item.image.url}
                    alt={item.image.description || item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-32 w-32 rounded-lg bg-muted flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              {item.qrCode && (
                <div className="h-32 w-32 rounded-lg bg-muted flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {item.category && <Badge variant="outline">Category: {item.category}</Badge>}
              {item.type && <Badge variant="outline">Type: {item.type}</Badge>}
              {item.weight !== null && <Badge variant="outline">Weight: {item.weight} lbs</Badge>}
              {item.isFragile && <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Fragile</Badge>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Origin Room</h3>
                {item.originRoom ? (
                  <Badge variant="outline" className="w-full justify-start">
                    {item.originRoom.name}
                  </Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">Not specified</p>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Destination Room</h3>
                {item.destinationRoom ? (
                  <Badge variant="outline" className="w-full justify-start">
                    {item.destinationRoom.name}
                  </Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">Not specified</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(PACKING_STATUS).map(([key, { label, icon: Icon }]) => (
                <Button
                  key={key}
                  variant={item.packingStatus === key ? 'default' : 'outline'}
                  size="sm"
                  className="h-8"
                  disabled={updatingStatus === key}
                  onClick={() => handleStatusUpdate(key)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Button>
              ))}
            </div>

            {item.specialInstructions && (
              <div>
                <h3 className="text-sm font-medium mb-1">Special Instructions</h3>
                <p className="text-sm text-muted-foreground">{item.specialInstructions}</p>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p>Created: {formatDate(item.createdAt)}</p>
              <p>Last Updated: {formatDate(item.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 