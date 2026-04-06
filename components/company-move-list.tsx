"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Users, Truck, Wrench, Box } from "lucide-react"
import { AddMoveDialog } from "@/components/add-move-dialog"
import { EditMoveDialog } from "@/components/edit-move-dialog"
import { DeleteMoveDialog } from "@/components/delete-move-dialog"
import { format } from "date-fns"

interface Move {
  id: string
  name: string
  description: string | null
  status: string
  moveType: string
  startDate: Date
  endDate: Date | null
  createdAt: Date
  collaborators: {
    user: {
      id: string
      firstName: string | null
      lastName: string | null
    }
    role: string
  }[]
  equipment: {
    equipment: {
      id: string
      name: string
    }
  }[]
  vehicles: {
    vehicle: {
      id: string
      name: string
    }
  }[]
  supplies: {
    supply: {
      id: string
      name: string
    }
    quantity: number
  }[]
}

interface CompanyMoveListProps {
  moves: Move[]
}

export function CompanyMoveList({ moves }: CompanyMoveListProps) {
  const [selectedMove, setSelectedMove] = useState<Move | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-500"
      case "scheduled":
        return "bg-blue-500"
      case "in_progress":
        return "bg-yellow-500"
      case "completed":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Moves</CardTitle>
          <CardDescription>Manage your company's moves</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Resources</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {moves.map((move) => (
              <TableRow key={move.id}>
                <TableCell className="font-medium">{move.name}</TableCell>
                <TableCell>{move.moveType}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(move.status)}>
                    {move.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(move.startDate), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {move.endDate
                    ? format(new Date(move.endDate), "MMM d, yyyy")
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{move.collaborators.length}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      <span>{move.vehicles.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wrench className="h-4 w-4" />
                      <span>{move.equipment.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Box className="h-4 w-4" />
                      <span>{move.supplies.length}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedMove(move)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedMove(move)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <AddMoveDialog />

      {selectedMove && (
        <>
          <EditMoveDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            move={selectedMove}
          />
          <DeleteMoveDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            move={selectedMove}
          />
        </>
      )}
    </Card>
  )
} 