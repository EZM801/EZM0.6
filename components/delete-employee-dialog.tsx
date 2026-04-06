"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface DeleteEmployeeDialogProps {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteEmployeeDialog({
  employee,
  open,
  onOpenChange,
}: DeleteEmployeeDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleDelete() {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/company/employees/${employee.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete employee")
      }

      toast.success("Employee deleted successfully")
      onOpenChange(false)
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("Error deleting employee:", error)
      toast.error("Failed to delete employee")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Employee</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {employee.firstName} {employee.lastName}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 