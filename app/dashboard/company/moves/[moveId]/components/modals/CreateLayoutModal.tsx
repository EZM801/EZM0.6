"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateLayoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  moveId: string
}

export function CreateLayoutModal({ open, onOpenChange, moveId }: CreateLayoutModalProps) {
  const [name, setName] = useState("")
  const [instructions, setInstructions] = useState("")
  const [orientation, setOrientation] = useState<"ORIGIN" | "DESTINATION" | "STOP">("ORIGIN")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/company/moves/${moveId}/layouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          instructions,
          orientation,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create layout")
      }

      onOpenChange(false)
      setName("")
      setInstructions("")
      setOrientation("ORIGIN")
    } catch (error) {
      console.error("Error creating layout:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Layout</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orientation">Orientation</Label>
            <Select
              value={orientation}
              onValueChange={(value: "ORIGIN" | "DESTINATION" | "STOP") => setOrientation(value)}
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
          <Button type="submit">Create Layout</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 