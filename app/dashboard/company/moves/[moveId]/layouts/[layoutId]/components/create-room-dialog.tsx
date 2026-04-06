"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Room {
  id: string
  name: string
  description: string | null
}

interface CreateRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  moveId: string
  layoutId: string
  onRoomCreated: (room: Room) => void
}

export function CreateRoomDialog({
  open,
  onOpenChange,
  moveId,
  layoutId,
  onRoomCreated
}: CreateRoomDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const validatedData = formSchema.parse(formData)

      const response = await fetch(
        `/api/company/moves/${moveId}/layouts/${layoutId}/rooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validatedData),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to create room")
      }

      const data = await response.json()
      onRoomCreated(data.data)
      toast.success("Room created successfully")
      onOpenChange(false)
      setFormData({ name: "", description: "" })
    } catch (error) {
      console.error("Error creating room:", error)
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      } else {
        toast.error("Failed to create room")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-none rounded-3xl">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Room Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Living Room, Kitchen, etc."
                className="rounded-full"
                required
                minLength={2}
                maxLength={255}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add any special notes about this room"
                className="min-h-[100px] rounded-2xl"
                maxLength={1000}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Room"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 