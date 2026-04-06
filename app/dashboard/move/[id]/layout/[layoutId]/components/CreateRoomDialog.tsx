"use client"

import { Room } from "@/types/layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface CreateRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  layoutId: string
  onRoomCreated: (room: Room) => void
}

export function CreateRoomDialog({ open, onOpenChange, layoutId, onRoomCreated }: CreateRoomDialogProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [instructions, setInstructions] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/layouts/${layoutId}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, instructions }),
      })

      if (!response.ok) {
        throw new Error("Failed to create room")
      }

      const room = await response.json()
      onRoomCreated(room)
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Error creating room:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Room Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Living Room"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="instructions" className="text-sm font-medium">
              Instructions
            </label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Add any specific instructions for this room..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Room"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 