"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { useLayouts } from "@/app/hooks/use-layouts"
import { toast } from "sonner"

interface CreateLayoutDialogProps {
  moveId: string
}

export function CreateLayoutDialog({ moveId }: CreateLayoutDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [instructions, setInstructions] = useState("")
  const [orientation, setOrientation] = useState<"origin" | "destination" | "stop">("origin")
  const { useCreateLayoutMutation } = useLayouts()
  const createLayoutMutation = useCreateLayoutMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Please enter a layout name")
      return
    }

    try {
      const result = await createLayoutMutation.mutateAsync({
        moveId,
        name,
        orientation,
        instructions: instructions || null
      })

      setOpen(false)
      router.push(`/dashboard/move/${moveId}/layout/${result.id}`)
    } catch (error) {
      console.error("Error creating layout:", error)
      toast.error("Failed to create layout")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Layout
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Layout</DialogTitle>
          <DialogDescription>
            Add a new layout to plan your move
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Layout Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter layout name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orientation">Layout Type</Label>
            <Select
              value={orientation}
              onValueChange={(value: "origin" | "destination" | "stop") => setOrientation(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select layout type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="origin">Origin Layout</SelectItem>
                <SelectItem value="destination">Destination Layout</SelectItem>
                <SelectItem value="stop">Stop Layout</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter any special instructions for this layout"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createLayoutMutation.isPending}>
              {createLayoutMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create Layout
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 