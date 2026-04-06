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
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Camera, Upload, QrCode, X } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { useLayouts, useRooms } from "@/app/hooks/useLayout"
import { Html5QrcodeScanner } from "html5-qrcode"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  weight: z.number().optional(),
  value: z.number().optional(),
  isFragile: z.boolean().default(false),
  specialInstructions: z.string().optional(),
  packingStatus: z.enum(["UNPACKED", "PACKED", "LOADED", "UNLOADED", "UNPACKED_AT_DESTINATION"]).default("UNPACKED"),
  originRoomId: z.string().optional(),
  destinationRoomId: z.string().optional(),
  stopRoomId: z.string().optional(),
  image: z.any().optional(),
  qrCode: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface PageProps {
  params: {
    moveId: string
    itemListId: string
    itemId?: string
  }
}

export default function CreateItemPage({ params }: PageProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    weight: undefined,
    value: undefined,
    isFragile: false,
    specialInstructions: "",
    packingStatus: "UNPACKED",
    originRoomId: undefined,
    destinationRoomId: undefined,
    stopRoomId: undefined,
    image: null,
    qrCode: undefined,
  })

  const { data: layouts, isLoading: isLoadingLayouts } = useLayouts(params.moveId, true)
  
  // Debug layouts data
  useEffect(() => {
    console.log('Layouts data in component:', layouts)
  }, [layouts])

  useEffect(() => {
    const fetchItem = async () => {
      if (params.itemId) {
        try {
          const response = await fetch(
            `/api/company/moves/${params.moveId}/item-lists/${params.itemListId}/items/${params.itemId}`
          )
          if (!response.ok) {
            throw new Error("Failed to fetch item")
          }
          const { data } = await response.json()
          setFormData({
            name: data.name,
            description: data.description || "",
            weight: data.weight,
            value: data.value,
            isFragile: data.isFragile,
            specialInstructions: data.specialInstructions || "",
            packingStatus: data.packingStatus,
            originRoomId: data.originRoomId,
            destinationRoomId: data.destinationRoomId,
            stopRoomId: data.stopRoomId,
          })
        } catch (error) {
          console.error("Error fetching item:", error)
          toast.error("Failed to fetch item details")
        }
      }
    }

    fetchItem()
  }, [params.moveId, params.itemListId, params.itemId])

  useEffect(() => {
    if (showQRScanner) {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 10,
      }, false)

      scanner.render(handleQRScan, (error) => {
        console.warn(`QR Code scan error: ${error}`)
      })

      return () => {
        scanner.clear()
      }
    }
  }, [showQRScanner])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'weight' | 'value'
  ) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }))
    }
  }

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = document.createElement('video')
      video.srcObject = stream
      await video.play()

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0)

      stream.getTracks().forEach(track => track.stop())

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
          setFormData((prev) => ({
            ...prev,
            image: file,
          }))
        }
      }, 'image/jpeg')
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error('Failed to access camera')
    }
  }

  const handleQRScan = (decodedText: string) => {
    setFormData((prev) => ({
      ...prev,
      qrCode: decodedText,
    }))
    setShowQRScanner(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create a copy of the form data without the image field
      const dataToSend = { ...formData }
      if (!dataToSend.image) {
        delete dataToSend.image
      }

      const validatedData = formSchema.parse(dataToSend)

      const url = params.itemId
        ? `/api/company/moves/${params.moveId}/item-lists/${params.itemListId}/items/${params.itemId}`
        : `/api/company/moves/${params.moveId}/item-lists/${params.itemListId}/items`

      const response = await fetch(url, {
        method: params.itemId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      })

      if (!response.ok) {
        throw new Error("Failed to create item")
      }

      toast.success("Item created successfully")
      router.push(`/dashboard/company/moves/${params.moveId}/item-lists/${params.itemListId}`)
      router.refresh()
    } catch (error) {
      console.error("Error saving item:", error)
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      } else {
        toast.error("Failed to create item")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 rounded-full">
          <Link href={`/dashboard/company/moves/${params.moveId}/item-lists/${params.itemListId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Item List
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">
          {params.itemId ? "Edit Item" : "Add New Item"}
        </h1>
        <p className="text-muted-foreground">
          {params.itemId ? "Update the details of your item" : "Add a new item to your moving list"}
        </p>
      </div>

      <Card className="mx-auto max-w-2xl border-none rounded-3xl soft-shadow">
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>
            {params.itemId ? "Update the details of your item" : "Enter the details of the item you want to add"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Item Image</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCameraCapture}
                    className="rounded-full"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                {formData.image && (
                  <div className="relative mt-2 w-32 h-32">
                    <Image
                      src={URL.createObjectURL(formData.image)}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 rounded-full"
                      onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* QR Code Section */}
              <div className="space-y-2">
                <Label>QR Code</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowQRScanner(true)}
                    className="rounded-full"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Scan QR Code
                  </Button>
                  {formData.qrCode && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{formData.qrCode}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFormData(prev => ({ ...prev, qrCode: undefined }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {showQRScanner && (
                  <div id="qr-reader" className="mt-2" />
                )}
              </div>

              {/* Basic Information */}
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  className="rounded-full"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter item description"
                  className="min-h-[100px] rounded-xl"
                />
              </div>

              {/* Room Selection */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Origin Room</Label>
                  <Select
                    value={formData.originRoomId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, originRoomId: value }))
                    }
                    disabled={isLoadingLayouts}
                  >
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder={isLoadingLayouts ? "Loading rooms..." : "Select origin room"} />
                    </SelectTrigger>
                    <SelectContent>
                      {layouts
                        ?.filter((layout: any) => layout.orientation === "ORIGIN")
                        .flatMap((layout: any) =>
                          layout.rooms.map((room: any) => (
                            <SelectItem key={room.id} value={room.id}>
                              {layout.name} - {room.name}
                            </SelectItem>
                          ))
                        )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Destination Room</Label>
                  <Select
                    value={formData.destinationRoomId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, destinationRoomId: value }))
                    }
                    disabled={isLoadingLayouts}
                  >
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder={isLoadingLayouts ? "Loading rooms..." : "Select destination room"} />
                    </SelectTrigger>
                    <SelectContent>
                      {layouts
                        ?.filter((layout: any) => layout.orientation === "DESTINATION")
                        .flatMap((layout: any) =>
                          layout.rooms.map((room: any) => (
                            <SelectItem key={room.id} value={room.id}>
                              {layout.name} - {room.name}
                            </SelectItem>
                          ))
                        )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Stop Room</Label>
                  <Select
                    value={formData.stopRoomId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, stopRoomId: value }))
                    }
                    disabled={isLoadingLayouts}
                  >
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder={isLoadingLayouts ? "Loading rooms..." : "Select stop room"} />
                    </SelectTrigger>
                    <SelectContent>
                      {layouts
                        ?.filter((layout: any) => layout.orientation === "STOP")
                        .flatMap((layout: any) =>
                          layout.rooms.map((room: any) => (
                            <SelectItem key={room.id} value={room.id}>
                              {layout.name} - {room.name}
                            </SelectItem>
                          ))
                        )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    value={formData.weight || ''}
                    onChange={(e) => handleNumberChange(e, 'weight')}
                    placeholder="Enter weight"
                    className="rounded-full"
                    step="0.1"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="value">Value ($)</Label>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    value={formData.value || ''}
                    onChange={(e) => handleNumberChange(e, 'value')}
                    placeholder="Enter value"
                    className="rounded-full"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isFragile">Fragile Item</Label>
                <Switch
                  id="isFragile"
                  checked={formData.isFragile}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isFragile: checked }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>Packing Status</Label>
                <Select
                  value={formData.packingStatus}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, packingStatus: value as FormData["packingStatus"] }))
                  }
                >
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Select packing status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNPACKED">Unpacked</SelectItem>
                    <SelectItem value="PACKED">Packed</SelectItem>
                    <SelectItem value="LOADED">Loaded</SelectItem>
                    <SelectItem value="UNLOADED">Unloaded</SelectItem>
                    <SelectItem value="UNPACKED_AT_DESTINATION">Unpacked at Destination</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  placeholder="Enter any special instructions"
                  className="min-h-[100px] rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full"
              >
                {isSubmitting
                  ? "Creating..."
                  : "Create Item"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 