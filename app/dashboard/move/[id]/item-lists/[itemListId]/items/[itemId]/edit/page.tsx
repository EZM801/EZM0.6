"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Camera, QrCode, Save, Loader2, Trash2, Package, PackageCheck, Truck, Home } from "lucide-react"
import { QRScanner } from "@/components/qr-scanner"
import { toast } from "sonner"
import { z } from "zod"
import { Switch } from "@/components/ui/switch"
import { useRouteParams } from "@/app/hooks/useRouteParams"
import { useItem } from "@/app/hooks/useItem"
import { useLayouts } from "@/app/hooks/use-layouts"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Layout, Room } from "@/types/layout"

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

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  weight: z.number().nullable(),
  isFragile: z.boolean().default(false),
  specialInstructions: z.string().optional().nullable(),
  qrCode: z.string().optional().nullable(),
  originRoomId: z.string().optional().nullable(),
  destinationRoomId: z.string().optional().nullable(),
  packingStatus: z.string().optional().nullable(),
})

type FormData = {
  name: string
  description: string
  weight: number | null
  isFragile: boolean
  specialInstructions: string
  qrCode: string
  originRoomId: string | null
  destinationRoomId: string | null
  packingStatus: string | null
}

interface RouteParams {
  id: string
  itemListId: string
  itemId: string
}

export default function EditItemPage() {
  const router = useRouter()
  const params = useRouteParams<RouteParams>()
  const { id: moveId, itemListId, itemId } = params
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const { data: item, isLoading: isLoadingItem, error: itemError, refetch: refetchItem } = useItem(moveId, itemListId, itemId)
  const { useLayoutsQuery } = useLayouts()
  const { data: layouts, isLoading: isLoadingLayouts } = useLayoutsQuery(moveId)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    weight: null,
    isFragile: false,
    specialInstructions: '',
    qrCode: '',
    originRoomId: null,
    destinationRoomId: null,
    packingStatus: null,
  })
  const [itemImage, setItemImage] = useState<{ url: string; mimeType: string; size: number; description: string; isPrimary: boolean } | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [scanSuccess, setScanSuccess] = useState<boolean | null>(null)

  // Load item data when available
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        weight: item.weight,
        isFragile: item.isFragile || false,
        specialInstructions: item.specialInstructions || '',
        qrCode: item.qrCode || '',
        originRoomId: item.originRoomId || null,
        destinationRoomId: item.destinationRoomId || null,
        packingStatus: item.packingStatus || null,
      })

      // Initialize image state if item has an image
      if (item.image) {
        setItemImage({
          url: item.image.url,
          mimeType: item.image.mimeType,
          size: item.image.size,
          description: item.image.description || '',
          isPrimary: item.image.isPrimary
        })
      }
    }
  }, [item])

  // Get all rooms from layouts
  const allRooms = layouts?.reduce((rooms: Room[], layout: Layout) => {
    return [...rooms, ...(layout.rooms || [])]
  }, []) || []

  // Get origin and destination rooms
  const originRooms = allRooms.filter((room: Room) => {
    const layout = layouts?.find((l: Layout) => l.id === room.layoutId)
    return layout?.orientation === 'origin'
  })

  const destinationRooms = allRooms.filter((room: Room) => {
    const layout = layouts?.find((l: Layout) => l.id === room.layoutId)
    return layout?.orientation === 'destination'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setItemImage({
          url: reader.result as string,
          mimeType: file.type,
          size: file.size,
          description: file.name,
          isPrimary: true
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  const handleQrCodeScan = (result: string) => {
    setQrCode(result)
    setScanSuccess(true)
    setShowScanner(false)
    toast.success("QR code was successfully captured")
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      const response = await fetch(`/api/moves/my/${moveId}/item-lists/${itemListId}/items/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete item')
      }

      toast.success('Item deleted successfully')
      router.push(`/dashboard/move/${moveId}/item-lists/${itemListId}`)
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete item')
    }
  }

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
      refetchItem()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to update item status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form data
      const validatedData = formSchema.parse(formData)

      const response = await fetch(`/api/moves/my/${moveId}/item-lists/${itemListId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...validatedData,
          image: itemImage
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to update item')
      }

      toast.success("Item updated successfully")
      router.push(`/dashboard/move/${moveId}/item-lists/${itemListId}`)
    } catch (error) {
      console.error(error)
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to update item')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingItem) {
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
          <CardHeader>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
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

  if (itemError) {
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

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 rounded-full">
          <Link href={`/dashboard/move/${moveId}/item-lists/${itemListId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Item List
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Edit Item</h1>
        <p className="text-muted-foreground">Update item in your moving list</p>
      </div>

      <Card className="mx-auto max-w-2xl border-none rounded-3xl soft-shadow">
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>Update the details of your item</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Sofa, TV, etc."
                  className="rounded-full"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value ? parseFloat(e.target.value) : null }))}
                  placeholder="Weight"
                  className="rounded-full"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  placeholder="Add any additional details about the item"
                  className="rounded-2xl"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  value={formData.specialInstructions || ''}
                  onChange={handleChange}
                  placeholder="Add any special handling instructions"
                  className="rounded-2xl"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFragile"
                    name="isFragile"
                    checked={formData.isFragile}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFragile: checked }))}
                  />
                  <Label htmlFor="isFragile">This item is fragile</Label>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Item Image</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCameraClick}
                    className="rounded-full"
                  >
                    <Camera className="mr-2 h-4 w-4" /> Take Photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageCapture}
                    className="hidden"
                  />
                </div>
                {itemImage && (
                  <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-lg border">
                    <Image
                      src={itemImage.url}
                      alt={itemImage.description}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label>QR Code</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowScanner(true)}
                    className="rounded-full"
                  >
                    <QrCode className="mr-2 h-4 w-4" /> Scan QR Code
                  </Button>
                </div>
                {qrCode && (
                  <div className="mt-2 rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Scanned QR Code:</p>
                    <p className="font-mono text-sm">{qrCode}</p>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Origin Room</Label>
                <Select
                  value={formData.originRoomId || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, originRoomId: value || null }))}
                >
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Select origin room" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {originRooms.map((room: Room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Destination Room</Label>
                <Select
                  value={formData.destinationRoomId || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, destinationRoomId: value || null }))}
                >
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Select destination room" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {destinationRooms.map((room: Room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Packing Status</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PACKING_STATUS).map(([key, { label, icon: Icon }]) => (
                    <Button
                      key={key}
                      type="button"
                      variant={formData.packingStatus === key ? 'default' : 'outline'}
                      size="sm"
                      className="h-8"
                      disabled={updatingStatus === key}
                      onClick={(e) => {
                        e.preventDefault()
                        handleStatusUpdate(key)
                      }}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                className="rounded-full"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Item
              </Button>
              <div className="flex gap-4">
                <Button variant="outline" type="button" asChild className="rounded-full">
                  <Link href={`/dashboard/move/${moveId}/item-lists/${itemListId}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {showScanner && (
        <QRScanner
          onScan={handleQrCodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
} 