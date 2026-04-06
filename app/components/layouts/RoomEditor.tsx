"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Room, UpdateRoomRequest } from "@/app/types/LayoutType"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface RoomEditorProps {
  room: Room
  layoutId: string
  onClose: () => void
}

export function RoomEditor({ room, layoutId, onClose }: RoomEditorProps) {
  const queryClient = useQueryClient()
  const [editedRoom, setEditedRoom] = useState<UpdateRoomRequest>({
    name: room.name,
    description: room.description || "",
  })

  // Update room mutation
  const updateRoomMutation = useMutation({
    mutationFn: async (updatedRoom: UpdateRoomRequest) => {
      const response = await fetch(`/api/layouts/${layoutId}/rooms/${room.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRoom),
      })
      if (!response.ok) throw new Error("Failed to update room")
      const result = await response.json()
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["layouts"] })
      toast.success("Room updated successfully")
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateRoomMutation.mutate(editedRoom)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Room</CardTitle>
        <CardDescription>Update room details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Room Name</Label>
            <Input
              id="name"
              value={editedRoom.name}
              onChange={(e) => setEditedRoom({ ...editedRoom, name: e.target.value })}
              placeholder="e.g., Living Room"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={editedRoom.description}
              onChange={(e) => setEditedRoom({ ...editedRoom, description: e.target.value })}
              placeholder="Add any notes about this room"
            />
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateRoomMutation.isPending}>
              {updateRoomMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 