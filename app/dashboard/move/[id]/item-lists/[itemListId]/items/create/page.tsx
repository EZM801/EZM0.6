"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Camera, QrCode, Save, Loader2 } from "lucide-react"
import { QRScanner } from "@/components/qr-scanner"
import { toast } from "sonner"
import { z } from "zod"
import { Switch } from "@/components/ui/switch"
import { useRouteParams } from "@/app/hooks/useRouteParams"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { ImageUpload } from "@/components/ImageUpload"
import { use } from "react"

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  weight: z.number().nullable(),
  isFragile: z.boolean().default(false),
  specialInstructions: z.string().optional().nullable(),
  qrCode: z.string().min(1, 'QR Code is required').nullable(),
  originRoomId: z.string().optional().nullable(),
  destinationRoomId: z.string().optional().nullable(),
})

type FormData = {
  name: string
  description: string
  weight: number | null
  isFragile: boolean
  specialInstructions: string
  qrCode: string | null
  originRoomId: string | null
  destinationRoomId: string | null
}

interface RouteParams {
  id: string
  itemListId: string
}

interface Room {
  id: string
  name: string
  floorLevel?: number
  layoutId: string
  layoutType: 'current' | 'new'
}

interface Layout {
  id: string
  orientation: string
}

interface PageProps {
  params: { id: string; itemListId: string }
}

export default function CreateItemPage({ params }: PageProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    weight: null,
    isFragile: false,
    specialInstructions: '',
    qrCode: null,
    originRoomId: null,
    destinationRoomId: null,
  })
  const [itemImage, setItemImage] = useState<File | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [scanSuccess, setScanSuccess] = useState<boolean | null>(null)

  // Fetch move details to get layout IDs
  const { data: move } = useQuery({
    queryKey: ["move", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/moves/my/${params.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch move")
      }
      return response.json()
    },
  })

  // Fetch rooms from all layouts
  const { data: rooms } = useQuery({
    queryKey: ["moveRooms", params.id],
    queryFn: async () => {
      if (!move) return []
      
      const rooms: Room[] = []
      
      try {
        // Fetch all layouts for the move
        const layoutsResponse = await fetch(`/api/moves/${params.id}/layouts`)
        if (!layoutsResponse.ok) {
          console.error('Failed to fetch layouts:', layoutsResponse.statusText)
          return []
        }
        
        const layouts = await layoutsResponse.json()
        console.log('Fetched layouts:', layouts)
        
        // Fetch rooms for each layout
        for (const layout of layouts.data) {
          const roomsResponse = await fetch(`/api/layouts/${layout.id}/rooms`)
          if (roomsResponse.ok) {
            const layoutRooms = await roomsResponse.json()
            console.log(`Rooms for layout ${layout.id}:`, layoutRooms)
            
            rooms.push(...layoutRooms.data.map((room: any) => ({
              ...room,
              layoutId: layout.id,
              layoutType: layout.orientation === 'origin' ? 'current' : 'new'
            })))
          } else {
            console.error(`Failed to fetch rooms for layout ${layout.id}:`, roomsResponse.statusText)
          }
        }
        
        console.log('Final rooms array:', rooms)
        return rooms
      } catch (error) {
        console.error('Error fetching rooms:', error)
        return []
      }
    },
    enabled: !!move,
  })

  // Add loading state handling
  if (!rooms) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 rounded-full">
            <Link href={`/dashboard/move/${params.id}/item-lists/${params.itemListId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Item List
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Add New Item</h1>
          <p className="text-muted-foreground">Loading rooms...</p>
        </div>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (file: File | null) => {
    setItemImage(file)
  }

  const handleQrCodeScan = (data: string) => {
    setQrCode(data)
    setShowScanner(false)
    setScanSuccess(true)
    toast.success('QR Code scanned successfully')
  }

  const handleScanError = () => {
    setScanSuccess(false)
    toast.error("Could not capture QR code. Please try again.")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form data
      const validatedData = formSchema.parse({
        ...formData,
        qrCode: qrCode || null
      })

      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('name', validatedData.name)
      formDataToSend.append('description', validatedData.description || '')
      formDataToSend.append('weight', validatedData.weight?.toString() || '')
      formDataToSend.append('isFragile', validatedData.isFragile.toString())
      formDataToSend.append('specialInstructions', validatedData.specialInstructions || '')
      formDataToSend.append('qrCode', qrCode || '')
      formDataToSend.append('originRoomId', validatedData.originRoomId || '')
      formDataToSend.append('destinationRoomId', validatedData.destinationRoomId || '')
      if (itemImage) {
        formDataToSend.append('image', itemImage)
      }

      const response = await fetch(`/api/moves/my/${params.id}/item-lists/${params.itemListId}/items`, {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create item')
      }

      toast.success("Item created successfully")
      router.push(`/dashboard/move/${params.id}/item-lists/${params.itemListId}`)
    } catch (error) {
      console.error(error)
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to create item')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 rounded-full">
          <Link href={`/dashboard/move/${params.id}/item-lists/${params.itemListId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Item List
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Add New Item</h1>
        <p className="text-muted-foreground">Add a new item to your moving list</p>
      </div>

      <Card className="mx-auto max-w-2xl border-none rounded-3xl soft-shadow">
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>Enter the details of the item you want to add</CardDescription>
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
                  value={formData.description}
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
                  value={formData.specialInstructions}
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
                <Label htmlFor="originRoomId">Origin Room</Label>
                <Select
                  value={formData.originRoomId || ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, originRoomId: value || null }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms?.filter(room => room.layoutType === 'current').map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} (Current Home)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="destinationRoomId">Destination Room</Label>
                <Select
                  value={formData.destinationRoomId || ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, destinationRoomId: value || null }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms?.filter(room => room.layoutType === 'new').map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} (New Home)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Item Image</Label>
                <ImageUpload
                  onImageChange={handleImageChange}
                />
              </div>

              <div className="grid gap-2">
                <Label>QR Code *</Label>
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
                {!qrCode && (
                  <p className="text-sm text-destructive">Please scan the QR code sticker attached to the item</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" asChild className="rounded-full">
                <Link href={`/dashboard/move/${params.id}/item-lists/${params.itemListId}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Item
                  </>
                )}
              </Button>
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

