"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { CompanyMove } from "@prisma/client"
import { format } from "date-fns"

interface EditMoveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  move: CompanyMove
}

export function EditMoveModal({ open, onOpenChange, move }: EditMoveModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: move.name,
    description: move.description || "",
    moveType: move.moveType || "",
    startDate: move.startDate ? format(move.startDate, "yyyy-MM-dd") : "",
    endDate: move.endDate ? format(move.endDate, "yyyy-MM-dd") : "",
    clientName: move.clientName || "",
    clientEmail: move.clientEmail || "",
    clientPhone: move.clientPhone || "",
    estimatedBudget: move.estimatedBudget?.toString() || "",
    priority: move.priority || "MEDIUM",
    specialInstructions: move.specialInstructions || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Prepare the data for submission
      const submitData = {
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        estimatedBudget: formData.estimatedBudget ? parseFloat(formData.estimatedBudget) : null,
      }

      console.log("Submitting data:", submitData)

      const response = await fetch(`/api/company/moves/${move.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        throw new Error(errorData.error || "Failed to update move")
      }

      toast.success("Move updated successfully")
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating move:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update move")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Move Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="moveType" className="text-sm font-medium">
                Type
              </label>
              <Input
                id="moveType"
                value={formData.moveType}
                onChange={(e) => setFormData({ ...formData, moveType: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium">
                Start Date
              </label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="endDate" className="text-sm font-medium">
                End Date
              </label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="clientName" className="text-sm font-medium">
                Client Name
              </label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="clientEmail" className="text-sm font-medium">
                Client Email
              </label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="clientPhone" className="text-sm font-medium">
                Client Phone
              </label>
              <Input
                id="clientPhone"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="estimatedBudget" className="text-sm font-medium">
                Estimated Budget
              </label>
              <Input
                id="estimatedBudget"
                type="number"
                value={formData.estimatedBudget}
                onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="specialInstructions" className="text-sm font-medium">
              Special Instructions
            </label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 