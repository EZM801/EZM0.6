"use client"

import { useState, useEffect } from "react"
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

interface Move {
  id: string
  name: string
}

interface DeleteMoveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  move: Move
}

export function DeleteMoveDialog({ open, onOpenChange, move }: DeleteMoveDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!open) {
      setIsDeleting(false)
    }
  }, [open])

  const onDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/company/moves/${move.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete move")
      }

      toast.success("Move deleted successfully")
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete move")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Move</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the move "{move.name}"? This action cannot be undone.
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