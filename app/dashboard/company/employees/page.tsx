"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EmployeeList } from "@/components/employee-list"
import { AddEmployeeDialog } from "@/components/add-employee-dialog"

interface Employee {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await fetch("/api/company/employees")
        if (!response.ok) {
          throw new Error("Failed to fetch employees")
        }
        const data = await response.json()
        setEmployees(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage your company's employees
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>
      <EmployeeList employees={employees} />
      <AddEmployeeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onEmployeeAdded={() => {
          // Refresh the list
          fetch("/api/company/employees")
            .then(res => res.json())
            .then(data => setEmployees(data))
        }}
      />
    </div>
  )
}

