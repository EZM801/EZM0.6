"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Layout, Room, CreateRoomRequest } from "@/app/types/LayoutType"

export default function LayoutRoomsPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [newRoom, setNewRoom] = useState({ name: "", description: "" })

  const moveId = params.id as string
  const layoutId = params.layoutId as string

  if (!moveId || !layoutId) {
    return (
      <div className="container py-10">
        <div className="text-destructive">Invalid move ID or layout ID</div>
      </div>
    )
  }

  // Fetch layout data
  const { data: layout, isLoading } = useQuery({
    queryKey: ["layout", layoutId],
    queryFn: async () => {
      const response = await fetch(`/api/layouts/${layoutId}`)
      if (!response.ok) throw new Error("Failed to fetch layout")
      const result = await response.json()
      return result.data
    },
  })

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: async (room: CreateRoomRequest) => {
      const response = await fetch(`/api/layouts/${layoutId}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(room),
      })
      if (!response.ok) throw new Error("Failed to create room")
      const result = await response.json()
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["layout", layoutId] })
      setNewRoom({ name: "", description: "" })
      toast.success("Room added successfully")
    },
  })

  // Delete room mutation
  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const response = await fetch(`/api/layouts/${layoutId}/rooms/${roomId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete room")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["layout", layoutId] })
      toast.success("Room deleted successfully")
    },
  })

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoom.name.trim()) {
      toast.error("Please enter a room name")
      return
    }

    createRoomMutation.mutate({
      layoutId,
      name: newRoom.name.trim(),
      description: newRoom.description.trim() || undefined,
    })
  }

  const handleDeleteRoom = (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return
    deleteRoomMutation.mutate(roomId)
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 rounded-full">
          <Link href={`/dashboard/move/${moveId}?tab=layouts`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Layouts
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">{layout?.name}</h1>
        <p className="text-muted-foreground">Manage rooms in your layout</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none rounded-3xl soft-shadow">
          <CardHeader>
            <CardTitle>Add New Room</CardTitle>
            <CardDescription>Create a new room in your layout</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddRoom} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Room Name</Label>
                <Input
                  id="name"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="e.g., Living Room"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  placeholder="Add any notes about this room"
                />
              </div>

              <Button type="submit" disabled={createRoomMutation.isPending}>
                {createRoomMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Room
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-none rounded-3xl soft-shadow">
          <CardHeader>
            <CardTitle>Rooms</CardTitle>
            <CardDescription>Manage your layout's rooms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {layout?.rooms?.map((room: Room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{room.name}</h4>
                    {room.description && (
                      <p className="text-sm text-muted-foreground">{room.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRoom(room.id)}
                    disabled={deleteRoomMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(!layout?.rooms || layout.rooms.length === 0) && (
                <p className="text-muted-foreground text-center py-4">
                  No rooms added yet. Add your first room to get started.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 