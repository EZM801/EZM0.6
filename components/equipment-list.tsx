"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { AddEquipmentDialog } from "@/components/add-equipment-dialog"
import { EditEquipmentDialog } from "@/components/edit-equipment-dialog"
import { DeleteEquipmentDialog } from "@/components/delete-equipment-dialog"

interface Equipment {
  id: string
  name: string
  type: string
  serialNumber: string | null
  isActive: boolean
}

interface EquipmentListProps {
  equipment: Equipment[]
}

export function EquipmentList({ equipment }: EquipmentListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Equipment Inventory</CardTitle>
          <CardDescription>View and manage your equipment</CardDescription>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Equipment
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.serialNumber || "-"}</TableCell>
                <TableCell>
                  <Badge variant={item.isActive ? "default" : "secondary"}>
                    {item.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedEquipment(item)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedEquipment(item)
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

      <AddEquipmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      {selectedEquipment && (
        <>
          <EditEquipmentDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            equipment={selectedEquipment}
          />
          <DeleteEquipmentDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            equipment={selectedEquipment}
          />
        </>
      )}
    </Card>
  )
} 