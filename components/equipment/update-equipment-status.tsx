"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface UpdateEquipmentStatusProps {
  equipmentId: string
  currentStatus: string
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "REPAIR", label: "Repair" },
  { value: "RETIRED", label: "Retired" },
]

export function UpdateEquipmentStatus({ equipmentId, currentStatus }: UpdateEquipmentStatusProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/company/equipment/${equipmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      setStatus(newStatus)
      toast.success("Status updated successfully")
      router.refresh()
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Select
      value={status}
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 