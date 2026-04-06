"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface Equipment {
  id: string
  name: string
  type: string
  serialNumber: string | null
  isActive: boolean
}

interface DeleteEquipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment: Equipment
}

export function DeleteEquipmentDialog({
  open,
  onOpenChange,
  equipment,
}: DeleteEquipmentDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function onDelete() {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/company/equipment/${equipment.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete equipment")
      }

      toast.success("Equipment deleted successfully")
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete equipment")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Equipment</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {equipment.name}? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 