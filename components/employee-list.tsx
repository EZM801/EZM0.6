"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { EditEmployeeDialog } from "@/components/edit-employee-dialog"
import { DeleteEmployeeDialog } from "@/components/delete-employee-dialog"
import { AddEmployeeDialog } from "@/components/add-employee-dialog"

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "WORKER" | "FOREMAN" | "ADMIN"
  isActive: boolean
  createdAt: string
}

interface EmployeeListProps {
  employees: Employee[]
}

export function EmployeeList({ employees }: EmployeeListProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "FOREMAN":
        return "default"
      case "WORKER":
        return "secondary"
      case "ADMIN":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? "default" : "secondary"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>View and manage your company's employees</CardDescription>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">
                  {employee.firstName} {employee.lastName}
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(employee.role)}>
                    {employee.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(employee.isActive)}>
                    {employee.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(employee.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedEmployee(employee)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedEmployee(employee)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {selectedEmployee && (
        <>
          <EditEmployeeDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            employee={selectedEmployee}
          />
          <DeleteEmployeeDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            employee={selectedEmployee}
          />
        </>
      )}

      <AddEmployeeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onEmployeeAdded={() => {
          // Refresh the employee list
          window.location.reload()
        }}
      />
    </Card>
  )
} 