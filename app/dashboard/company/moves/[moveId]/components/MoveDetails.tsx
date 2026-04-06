"use client"

import { CompanyMove } from "@prisma/client"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, ChevronRight, Camera, Upload, QrCode, Scan } from "lucide-react"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { z } from "zod"
import { Html5QrcodeScanner } from "html5-qrcode"
import Link from "next/link"

// Import modals
import { CreateTaskModal } from "./modals/CreateTaskModal"
import { CreateLayoutModal } from "./modals/CreateLayoutModal"
import { CreateItemListModal } from "./modals/CreateItemListModal"
import { EditMoveModal } from "./modals/EditMoveModal"

interface MoveDetailsProps {
  move: CompanyMove & {
    fromAddress: {
      street: string
      city: string
      state: string
      zipCode: string
    }
    toAddress: {
      street: string
      city: string
      state: string
      zipCode: string
    }
    tasks: {
      id: string
      name: string
      description: string | null
      status: string
      priority: string
      startDate: Date | null
      endDate: Date | null
    }[]
    itemLists: {
      id: string
      name: string
      description: string | null
      items: {
        id: string
        name: string
        description: string | null
        originRoom: {
          id: string
          name: string
        } | null
        destinationRoom: {
          id: string
          name: string
        } | null
      }[]
    }[]
    layouts: {
      id: string
      name: string
      instructions: string | null
      orientation: string
      rooms: {
        id: string
        name: string
        description: string | null
        originItems: {
          id: string
          name: string
        }[]
        destinationItems: {
          id: string
          name: string
        }[]
        stopItems: {
          id: string
          name: string
        }[]
      }[]
    }[]
  }
}

const itemFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  weight: z.number().optional(),
  value: z.number().optional(),
  isFragile: z.boolean().default(false),
  specialInstructions: z.string().optional(),
  packingStatus: z.enum(['UNPACKED', 'PACKED', 'LOADED', 'UNLOADED', 'UNPACKED_AT_DESTINATION']).default('UNPACKED'),
  originRoomId: z.string().optional(),
  destinationRoomId: z.string().optional(),
  stopRoomId: z.string().optional(),
  image: z.string().optional(),
  qrCode: z.string().optional(),
})

type ItemFormData = z.infer<typeof itemFormSchema>

type Orientation = "ORIGIN" | "DESTINATION" | "STOP"

export function MoveDetails({ move }: MoveDetailsProps) {
  const router = useRouter()
  const [showItemListModal, setShowItemListModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showLayoutModal, setShowLayoutModal] = useState(false)
  const [selectedItemList, setSelectedItemList] = useState<string | null>(null)
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showAddRoomModal, setShowAddRoomModal] = useState(false)
  const [newItem, setNewItem] = useState<ItemFormData>({
    name: "",
    description: "",
    weight: undefined,
    value: undefined,
    isFragile: false,
    specialInstructions: "",
    packingStatus: "UNPACKED",
    originRoomId: "",
    destinationRoomId: "",
    stopRoomId: "",
  })
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [editingLayout, setEditingLayout] = useState<string | null>(null)
  const [editingItemList, setEditingItemList] = useState<string | null>(null)
  const [editLayoutData, setEditLayoutData] = useState({
    name: "",
    instructions: "",
    orientation: "ORIGIN" as Orientation,
  })
  const [editItemListData, setEditItemListData] = useState({
    name: "",
    description: "",
  })
  const [showQrScanner, setShowQrScanner] = useState(false)
  const [scannedQrCode, setScannedQrCode] = useState<string | null>(null)

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/company/moves/${move.id}/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      toast.success("Task deleted successfully")
      router.refresh()
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Failed to delete task")
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const validatedData = itemFormSchema.parse(newItem)

      const response = await fetch(`/api/company/moves/${move.id}/item-lists/${selectedItemList}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      })

      if (!response.ok) {
        throw new Error("Failed to add item")
      }

      toast.success("Item added successfully")
      setShowAddItemModal(false)
      setNewItem({
        name: "",
        description: "",
        weight: undefined,
        value: undefined,
        isFragile: false,
        specialInstructions: "",
        packingStatus: "UNPACKED",
        originRoomId: "",
        destinationRoomId: "",
        stopRoomId: "",
      })
      router.refresh()
    } catch (error) {
      console.error("Error adding item:", error)
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      } else {
        toast.error("Failed to add item")
      }
    }
  }

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/company/moves/${move.id}/layouts/${selectedLayout}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRoom),
      })

      if (!response.ok) {
        throw new Error("Failed to add room")
      }

      toast.success("Room added successfully")
      setShowAddRoomModal(false)
      setNewRoom({
        name: "",
        description: "",
      })
      router.refresh()
    } catch (error) {
      console.error("Error adding room:", error)
      toast.error("Failed to add room")
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setNewItem({ ...newItem, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
      }
      setShowCamera(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast.error("Failed to access camera")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg')
        setImagePreview(imageData)
        setNewItem({ ...newItem, image: imageData })
        stopCamera()
      }
    }
  }

  const generateQRCode = () => {
    // Generate a unique QR code for the item
    const qrData = `ITEM_${move.id}_${Date.now()}`
    // In a real implementation, you would use a QR code library here
    // For now, we'll just use a placeholder
    setQrCodePreview(qrData)
    setNewItem({ ...newItem, qrCode: qrData })
  }

  const handleEditLayout = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/company/moves/${move.id}/layouts/${editingLayout}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editLayoutData),
      })

      if (!response.ok) {
        throw new Error("Failed to update layout")
      }

      toast.success("Layout updated successfully")
      setEditingLayout(null)
      router.refresh()
    } catch (error) {
      console.error("Error updating layout:", error)
      toast.error("Failed to update layout")
    }
  }

  const handleDeleteLayout = async (layoutId: string) => {
    try {
      const response = await fetch(`/api/company/moves/${move.id}/layouts/${layoutId}`, {
        method: "DELETE",
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

  const handleEditItemList = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/company/moves/${move.id}/item-lists/${editingItemList}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editItemListData),
      })

      if (!response.ok) {
        throw new Error("Failed to update item list")
      }

      toast.success("Item list updated successfully")
      setEditingItemList(null)
      router.refresh()
    } catch (error) {
      console.error("Error updating item list:", error)
      toast.error("Failed to update item list")
    }
  }

  const handleDeleteItemList = async (itemListId: string) => {
    try {
      const response = await fetch(`/api/company/moves/${move.id}/item-lists/${itemListId}`, {
        method: "DELETE",
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

  // Add QR Scanner functions
  const startQrScanner = () => {
    setShowQrScanner(true)
    // Initialize scanner after component mounts
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          false
        )

        scanner.render(onScanSuccess, onScanError)
      } catch (error) {
        console.error("Error initializing QR scanner:", error)
        toast.error("Failed to initialize QR scanner")
        setShowQrScanner(false)
      }
    }, 100)
  }

  const stopQrScanner = () => {
    try {
      const scannerElement = document.getElementById("qr-reader")
      if (scannerElement) {
        scannerElement.innerHTML = ""
      }
    } catch (error) {
      console.error("Error stopping QR scanner:", error)
    }
    setShowQrScanner(false)
  }

  const onScanSuccess = (decodedText: string) => {
    try {
      setScannedQrCode(decodedText)
      setNewItem({ ...newItem, qrCode: decodedText })
      stopQrScanner()
      toast.success("QR Code scanned successfully")
    } catch (error) {
      console.error("Error processing scanned QR code:", error)
      toast.error("Failed to process QR code")
    }
  }

  const onScanError = (error: string) => {
    console.warn(`QR Code scan error: ${error}`)
  }

  // Update the QR Scanner Modal
  const renderQrScannerModal = () => (
    <Dialog open={showQrScanner} onOpenChange={stopQrScanner}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div id="qr-reader" className="w-full aspect-square"></div>
          <p className="text-sm text-muted-foreground text-center">
            Position the QR code within the frame to scan
          </p>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={stopQrScanner}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  // Update the Media Section in the form to use the new QR code section
  const renderMediaSection = () => (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Image Upload */}
      <div className="space-y-4">
        <label className="text-sm font-medium">Item Image</label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={startCamera}
            className="flex-1"
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
        {imagePreview && (
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="Item preview"
              className="h-32 w-32 object-cover rounded-md"
            />
          </div>
        )}
      </div>

      {/* QR Code */}
      <div className="space-y-4">
        <label className="text-sm font-medium">QR Code</label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={startQrScanner}
            className="w-full"
          >
            <Scan className="mr-2 h-4 w-4" />
            Scan QR Code
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={generateQRCode}
            className="w-full"
          >
            <QrCode className="mr-2 h-4 w-4" />
            Generate New QR Code
          </Button>
        </div>
        {(scannedQrCode || qrCodePreview) && (
          <div className="mt-2">
            <div className="h-32 w-32 bg-gray-100 rounded-md flex items-center justify-center">
              <span className="text-xs text-center break-all p-2">
                {scannedQrCode || qrCodePreview}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Add Employees, Vehicles, Equipment Links */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Link href={`/dashboard/company/moves/${move.id}/employees/add`}>
          <Button variant="default" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Employees
          </Button>
        </Link>
        <Link href={`/dashboard/company/moves/${move.id}/vehicles/add`}>
          <Button variant="default" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Vehicles
          </Button>
        </Link>
        <Link href={`/dashboard/company/moves/${move.id}/equipment/add`}>
          <Button variant="default" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Equipment
          </Button>
        </Link>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{move.name}</h1>
          <p className="text-muted-foreground">{move.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Move
          </Button>
          <Button onClick={() => setShowTaskModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
          <Button onClick={() => setShowLayoutModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Layout
          </Button>
          <Button onClick={() => setShowItemListModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item List
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Move Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <p>{move.moveType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant="outline">{move.status}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Start Date</p>
              <p>{move.startDate ? format(move.startDate, "PPP") : "Not set"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">End Date</p>
              <p>{move.endDate ? format(move.endDate, "PPP") : "Not set"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Client</p>
              <p>{move.clientName}</p>
              <p className="text-sm text-muted-foreground">{move.clientEmail}</p>
              <p className="text-sm text-muted-foreground">{move.clientPhone}</p>
            </div>
            {move.estimatedBudget && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estimated Budget</p>
                <p>${move.estimatedBudget.toLocaleString()}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Priority</p>
              <Badge variant="outline">{move.priority}</Badge>
            </div>
            {move.specialInstructions && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Special Instructions</p>
                <p>{move.specialInstructions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Addresses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">From</p>
              <p>{move.fromAddress.street}</p>
              <p className="text-sm text-muted-foreground">
                {move.fromAddress.city}, {move.fromAddress.state} {move.fromAddress.zipCode}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">To</p>
              <p>{move.toAddress.street}</p>
              <p className="text-sm text-muted-foreground">
                {move.toAddress.city}, {move.toAddress.state} {move.toAddress.zipCode}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {move.tasks.map((task) => (
              <Link key={task.id} href={`/dashboard/company/moves/${move.id}/tasks/${task.id}`} className="block rounded-lg border p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{task.name}</h3>
                    <Badge variant="outline" className="mt-1">{task.status}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); handleDeleteTask(task.id) }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
                )}
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Priority: {task.priority}</span>
                  {task.startDate && <span>Start: {format(task.startDate, "PPP")}</span>}
                  {task.endDate && <span>End: {format(task.endDate, "PPP")}</span>}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Item Lists</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {move.itemLists.map((list) => (
              <Link key={list.id} href={`/dashboard/company/moves/${move.id}/item-lists/${list.id}`} className="block rounded-lg border p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{list.name}</h3>
                    <Badge variant="outline" className="mt-1">{list.items.length} items</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={e => { e.preventDefault(); e.stopPropagation(); setSelectedItemList(list.id); setShowAddItemModal(true) }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={e => { e.preventDefault(); e.stopPropagation(); setEditingItemList(list.id); setEditItemListData({ name: list.name, description: list.description || "" }) }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={e => { e.preventDefault(); e.stopPropagation(); handleDeleteItemList(list.id) }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {list.description && (
                  <p className="text-sm text-muted-foreground mt-2">{list.description}</p>
                )}
                {list.items.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {list.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span>{item.name}</span>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {item.originRoom && <span>From: {item.originRoom.name}</span>}
                          {item.destinationRoom && <span>To: {item.destinationRoom.name}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {move.layouts.map((layout) => (
              <Link key={layout.id} href={`/dashboard/company/moves/${move.id}/layouts/${layout.id}`} className="block rounded-lg border p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{layout.name}</h3>
                    <Badge variant="outline" className="mt-1">{layout.rooms.length} rooms</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={e => { e.preventDefault(); e.stopPropagation(); setSelectedLayout(layout.id); setShowAddRoomModal(true) }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={e => { e.preventDefault(); e.stopPropagation(); setEditingLayout(layout.id); setEditLayoutData({ name: layout.name, instructions: layout.instructions || "", orientation: layout.orientation as Orientation }) }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={e => { e.preventDefault(); e.stopPropagation(); handleDeleteLayout(layout.id) }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {layout.instructions && (
                  <p className="text-sm text-muted-foreground mt-2">{layout.instructions}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">Orientation: {layout.orientation}</p>
                {layout.rooms.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {layout.rooms.map((room) => (
                      <div key={room.id} className="flex items-center justify-between text-sm">
                        <span>{room.name}</span>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>Origin Items: {room.originItems.length}</span>
                          <span>Destination Items: {room.destinationItems.length}</span>
                          <span>Stop Items: {room.stopItems.length}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <EditMoveModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        move={move}
      />
      <CreateTaskModal
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        moveId={move.id}
      />
      <CreateLayoutModal
        open={showLayoutModal}
        onOpenChange={setShowLayoutModal}
        moveId={move.id}
      />
      <CreateItemListModal
        open={showItemListModal}
        onOpenChange={setShowItemListModal}
        moveId={move.id}
      />

      {/* Add Item Modal */}
      <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="itemName" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="itemName"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g., Dining Table, TV, etc."
                    required
                    minLength={2}
                    maxLength={255}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="itemDescription" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="itemDescription"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Add a description of the item"
                    className="min-h-[100px]"
                    maxLength={1000}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="weight" className="text-sm font-medium">
                      Weight (lbs)
                    </label>
                    <Input
                      id="weight"
                      type="number"
                      value={newItem.weight || ""}
                      onChange={(e) => setNewItem({ ...newItem, weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="Enter weight"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="value" className="text-sm font-medium">
                      Value ($)
                    </label>
                    <Input
                      id="value"
                      type="number"
                      value={newItem.value || ""}
                      onChange={(e) => setNewItem({ ...newItem, value: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="Enter value"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFragile"
                    checked={newItem.isFragile}
                    onCheckedChange={(checked) => setNewItem({ ...newItem, isFragile: checked })}
                  />
                  <label htmlFor="isFragile" className="text-sm font-medium">
                    Fragile Item
                  </label>
                </div>
              </div>

              {/* Location and Status */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="packingStatus" className="text-sm font-medium">
                    Packing Status
                  </label>
                  <Select
                    value={newItem.packingStatus}
                    onValueChange={(value) => setNewItem({ ...newItem, packingStatus: value as ItemFormData['packingStatus'] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
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

                <div className="space-y-2">
                  <label htmlFor="originRoom" className="text-sm font-medium">
                    Origin Room
                  </label>
                  <Select
                    value={newItem.originRoomId}
                    onValueChange={(value) => setNewItem({ ...newItem, originRoomId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select origin room" />
                    </SelectTrigger>
                    <SelectContent>
                      {move.layouts
                        .filter(layout => layout.orientation === "ORIGIN")
                        .flatMap((layout) =>
                          layout.rooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {layout.name} - {room.name}
                            </SelectItem>
                          ))
                        )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="destinationRoom" className="text-sm font-medium">
                    Destination Room
                  </label>
                  <Select
                    value={newItem.destinationRoomId}
                    onValueChange={(value) => setNewItem({ ...newItem, destinationRoomId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination room" />
                    </SelectTrigger>
                    <SelectContent>
                      {move.layouts
                        .filter(layout => layout.orientation === "DESTINATION")
                        .flatMap((layout) =>
                          layout.rooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {layout.name} - {room.name}
                            </SelectItem>
                          ))
                        )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Add Stop Room selection if needed */}
                <div className="space-y-2">
                  <label htmlFor="stopRoom" className="text-sm font-medium">
                    Stop Room (Optional)
                  </label>
                  <Select
                    value={newItem.stopRoomId}
                    onValueChange={(value) => setNewItem({ ...newItem, stopRoomId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stop room" />
                    </SelectTrigger>
                    <SelectContent>
                      {move.layouts
                        .filter(layout => layout.orientation === "STOP")
                        .flatMap((layout) =>
                          layout.rooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {layout.name} - {room.name}
                            </SelectItem>
                          ))
                        )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="specialInstructions" className="text-sm font-medium">
                    Special Instructions
                  </label>
                  <Textarea
                    id="specialInstructions"
                    value={newItem.specialInstructions}
                    onChange={(e) => setNewItem({ ...newItem, specialInstructions: e.target.value })}
                    placeholder="Add any special handling instructions"
                    maxLength={500}
                  />
                </div>
              </div>
            </div>

            {/* Media Section */}
            {renderMediaSection()}

            <div className="flex justify-end pt-4">
              <Button type="submit">Add Item</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Room Modal */}
      <Dialog open={showAddRoomModal} onOpenChange={setShowAddRoomModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Room</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddRoom} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="roomName" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="roomName"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="roomDescription" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="roomDescription"
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Add Room</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Camera Modal */}
      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-md"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={stopCamera}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={captureImage}
              >
                Capture
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Layout Modal */}
      <Dialog open={!!editingLayout} onOpenChange={() => setEditingLayout(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Layout</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditLayout} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="layoutName" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="layoutName"
                value={editLayoutData.name}
                onChange={(e) => setEditLayoutData({ ...editLayoutData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="layoutInstructions" className="text-sm font-medium">
                Instructions
              </label>
              <Textarea
                id="layoutInstructions"
                value={editLayoutData.instructions}
                onChange={(e) => setEditLayoutData({ ...editLayoutData, instructions: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="layoutOrientation" className="text-sm font-medium">
                Orientation
              </label>
              <Select
                value={editLayoutData.orientation}
                onValueChange={(value) => setEditLayoutData({ ...editLayoutData, orientation: value as Orientation })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORIGIN">Origin</SelectItem>
                  <SelectItem value="DESTINATION">Destination</SelectItem>
                  <SelectItem value="STOP">Stop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Item List Modal */}
      <Dialog open={!!editingItemList} onOpenChange={() => setEditingItemList(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item List</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditItemList} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="itemListName" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="itemListName"
                value={editItemListData.name}
                onChange={(e) => setEditItemListData({ ...editItemListData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="itemListDescription" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="itemListDescription"
                value={editItemListData.description}
                onChange={(e) => setEditItemListData({ ...editItemListData, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Modal */}
      {renderQrScannerModal()}
    </div>
  )
} 