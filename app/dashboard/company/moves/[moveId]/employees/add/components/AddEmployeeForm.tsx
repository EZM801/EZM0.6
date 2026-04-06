"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface Employee {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  role: string | null
}

interface AddEmployeeFormProps {
  moveId: string
  availableEmployees: Employee[]
}

export function AddEmployeeForm({ moveId, availableEmployees }: AddEmployeeFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    employeeId: "",
    role: "MOVER",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/company/moves/${moveId}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to add employee")
      }

      toast.success("Employee added successfully")
      router.refresh()
      router.back()
    } catch (error) {
      console.error("Error adding employee:", error)
      toast.error("Failed to add employee")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="employeeId">Employee</Label>
          <Select
            value={formData.employeeId}
            onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an employee" />
            </SelectTrigger>
            <SelectContent>
              {availableEmployees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.firstName || ''} {employee.lastName || ''} ({employee.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MOVER">Mover</SelectItem>
              <SelectItem value="FOREMAN">Foreman</SelectItem>
              <SelectItem value="DRIVER">Driver</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date (Optional)</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Employee"}
        </Button>
      </div>
    </form>
  )
} 