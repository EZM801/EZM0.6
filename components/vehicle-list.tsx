"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { AddVehicleDialog } from "@/components/add-vehicle-dialog"
import { EditVehicleDialog } from "@/components/edit-vehicle-dialog"
import { DeleteVehicleDialog } from "@/components/delete-vehicle-dialog"

interface Vehicle {
  id: string
  name: string
  type: string
  licensePlate: string
  capacity: number
  isAvailable: boolean
}

interface VehicleListProps {
  vehicles: Vehicle[]
}

export function VehicleList({ vehicles }: VehicleListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Vehicle Fleet</CardTitle>
          <CardDescription>View and manage your vehicles</CardDescription>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.name}</TableCell>
                <TableCell>{vehicle.type}</TableCell>
                <TableCell>{vehicle.licensePlate}</TableCell>
                <TableCell>{vehicle.capacity}</TableCell>
                <TableCell>
                  <Badge variant={vehicle.isAvailable ? "default" : "secondary"}>
                    {vehicle.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedVehicle(vehicle)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedVehicle(vehicle)
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

      <AddVehicleDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      {selectedVehicle && (
        <>
          <EditVehicleDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            vehicle={selectedVehicle}
          />
          <DeleteVehicleDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            vehicle={selectedVehicle}
          />
        </>
      )}
    </Card>
  )
} 