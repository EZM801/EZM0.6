"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Plus, Trash2, Edit2, Package, Box, Home, Truck, Image as ImageIcon, QrCode } from "lucide-react"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type PackingStatus = 'unpacked' | 'packed' | 'in_transit' | 'unpacked_at_destination';

interface Item {
  id: string
  name: string
  description: string | null
  weight: number | null
  isFragile: boolean
  specialInstructions: string | null
  qrCode: string | null
  originRoomId: string | null
  destinationRoomId: string | null
  category: string
  packingStatus: PackingStatus
  image: {
    url: string
    description: string | null
    mimeType: string
    size: number
    isPrimary: boolean
  } | null
  createdAt: string
  updatedAt: string
}

const STATUS_CONFIG = {
  unpacked: {
    icon: Package,
    label: 'Unpacked',
    color: 'bg-slate-100'
  },
  packed: {
    icon: Box,
    label: 'Packed',
    color: 'bg-blue-100'
  },
  in_transit: {
    icon: Truck,
    label: 'In Transit',
    color: 'bg-yellow-100'
  },
  unpacked_at_destination: {
    icon: Home,
    label: 'At Destination',
    color: 'bg-green-100'
  }
} as const;

export default function ItemListPage() {
  const router = useRouter()
  const params = useParams()
  const moveId = params?.id as string
  const itemListId = params?.itemListId as string
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`/api/moves/${moveId}/item-lists/${itemListId}/items`)
        if (!response.ok) throw new Error("Failed to fetch items")
        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
          setItems(data.data)
        } else {
          throw new Error("Invalid data format received")
        }
      } catch (error) {
        console.error("Error fetching items:", error)
        toast.error("Failed to load items")
        setItems([]) // Set empty array on error
      } finally {
        setIsLoading(false)
      }
    }

    if (moveId && itemListId) {
    fetchItems()
    }
  }, [moveId, itemListId])

  const handleEdit = (itemId: string) => {
    router.push(`/dashboard/move/${moveId}/item-lists/${itemListId}/items/${itemId}/edit`)
  }

  const handleDelete = async (itemId: string) => {
    try {
      const response = await fetch(`/api/moves/${moveId}/item-lists/${itemListId}/items/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error("Failed to delete item")
      }

      toast.success("Item deleted successfully")
      setItems(items.filter(item => item.id !== itemId))
    } catch (error) {
      console.error("Error deleting item:", error)
      toast.error("Failed to delete item")
    }
  }

  const calculateProgress = () => {
    if (items.length === 0) return 0
    const completedItems = items.filter(item => 
      item.packingStatus === 'packed' || 
      item.packingStatus === 'in_transit' || 
      item.packingStatus === 'unpacked_at_destination'
    ).length
    return Math.round((completedItems / items.length) * 100)
  }

  const handleStatusChange = async (itemId: string, status: PackingStatus) => {
    try {
      const response = await fetch(`/api/moves/${moveId}/item-lists/${itemListId}/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packingStatus: status }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || "Failed to update item status")
      }

      setItems(items.map(item => 
        item.id === itemId ? { ...item, packingStatus: status } : item
      ))
      toast.success("Item status updated")
    } catch (error) {
      console.error("Error updating item status:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update item status")
    }
  }

  const handleItemClick = (itemId: string) => {
    router.push(`/dashboard/move/${moveId}/item-lists/${itemListId}/items/${itemId}`)
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
            <p className="text-muted-foreground">Please wait while we load your items</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Item List</h1>
          <p className="text-muted-foreground">Manage your items for this move</p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/move/${moveId}/item-lists/${itemListId}/items/create`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Packing Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex justify-between items-center">
            <span className="text-sm font-medium">{calculateProgress()}% Complete</span>
            <span className="text-sm text-muted-foreground">{items.length} items total</span>
          </div>
          <Progress value={calculateProgress()} className="mb-4" />
          <div className="flex flex-wrap gap-4">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`p-1 rounded ${config.color}`}>
                  <config.icon className="h-4 w-4" />
                </div>
                <span className="text-sm">{config.label}</span>
                <Badge variant="secondary" className="ml-1">
                  {items.filter(item => item.packingStatus === status).length}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const StatusIcon = STATUS_CONFIG[item.packingStatus].icon
          return (
            <Card
              key={item.id}
              className={cn(
                "transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02]",
                "border-none rounded-3xl soft-shadow"
              )}
              onClick={() => handleItemClick(item.id)}
            >
            <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      "flex items-center gap-1",
                      STATUS_CONFIG[item.packingStatus].color
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {STATUS_CONFIG[item.packingStatus].label}
                  </Badge>
                </div>
                {item.description && (
                  <CardDescription className="line-clamp-2">
                    {item.description}
                  </CardDescription>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                  {item.image ? (
                    <div className="aspect-square relative rounded-lg overflow-hidden">
                      <Image
                        src={item.image.url}
                        alt={item.image.description || item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {item.category && (
                      <Badge variant="outline">{item.category}</Badge>
                    )}
                    {item.isFragile && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Fragile
                      </Badge>
                    )}
                    {item.weight !== null && (
                      <Badge variant="outline">{item.weight} lbs</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Updated {new Date(item.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(item.id)
                          }}
                        >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Item</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(item.id)
                          }}
                        >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete Item</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardFooter>
          </Card>
          )
        })}
      </div>
    </div>
  )
}

