"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Home, Building, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { CreateRoomDialog } from "./components/create-room-dialog"
import { RoomCard } from "./components/RoomCard"

interface Room {
  id: string
  name: string
  description: string | null
}

interface Layout {
  id: string
  name: string
  instructions: string | null
  orientation: string
  rooms: Room[]
}

interface PageProps {
  params: {
    moveId: string
    layoutId: string
  }
}

export default function LayoutPage({ params }: PageProps) {
  const router = useRouter()
  const [layout, setLayout] = useState<Layout | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateRoomDialogOpen, setIsCreateRoomDialogOpen] = useState(false)

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const response = await fetch(`/api/company/moves/${params.moveId}/layouts/${params.layoutId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch layout")
        }
        const data = await response.json()
        setLayout(data.data)
      } catch (error) {
        console.error("Error fetching layout:", error)
        toast.error("Failed to load layout details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLayout()
  }, [params.moveId, params.layoutId])

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const response = await fetch(
        `/api/company/moves/${params.moveId}/layouts/${params.layoutId}/rooms/${roomId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        throw new Error("Failed to delete room")
      }

      setLayout((prev) => 
        prev ? {
          ...prev,
          rooms: prev.rooms.filter(room => room.id !== roomId)
        } : null
      )
      toast.success("Room deleted successfully")
    } catch (error) {
      console.error("Error deleting room:", error)
      toast.error("Failed to delete room")
    }
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading layout details...</p>
        </div>
      </div>
    )
  }

  if (!layout) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-destructive">Layout not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 rounded-full">
          <Link href={`/dashboard/company/moves/${params.moveId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Move
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">{layout.name}</h1>
            <p className="text-muted-foreground">
              {layout.orientation === 'ORIGIN' ? 'Origin Location' : 'Destination Location'}
            </p>
          </div>
          <Button
            onClick={() => setIsCreateRoomDialogOpen(true)}
            className="rounded-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </div>
      </div>

      {layout.instructions && (
        <Card className="mb-8 border-none rounded-3xl soft-shadow">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{layout.instructions}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {layout.rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onDelete={handleDeleteRoom}
          />
        ))}
      </div>

      <CreateRoomDialog
        open={isCreateRoomDialogOpen}
        onOpenChange={setIsCreateRoomDialogOpen}
        moveId={params.moveId}
        layoutId={params.layoutId}
        onRoomCreated={(newRoom) => {
          setLayout((prev) => 
            prev ? {
              ...prev,
              rooms: [...prev.rooms, newRoom]
            } : null
          )
        }}
      />
    </div>
  )
} 