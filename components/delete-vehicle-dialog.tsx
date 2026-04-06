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

interface Vehicle {
  id: string
  name: string
}

interface DeleteVehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle
}

export function DeleteVehicleDialog({
  open,
  onOpenChange,
  vehicle,
}: DeleteVehicleDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function onDelete() {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/company/vehicles/${vehicle.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete vehicle")
      }

      toast.success("Vehicle deleted successfully")
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete vehicle")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Vehicle</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {vehicle.name}? This action cannot be
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