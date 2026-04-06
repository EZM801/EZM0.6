"use client"

import { MoveSupply } from "../types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface AllocatedSupplyListProps {
  moveId: string
  supplies: MoveSupply[]
}

export function AllocatedSupplyList({ moveId, supplies }: AllocatedSupplyListProps) {
  const queryClient = useQueryClient()

  const removeMutation = useMutation({
    mutationFn: async (supplyId: string) => {
      const response = await fetch(`/api/moves/${moveId}/supplies?supplyId=${supplyId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to remove supply")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moveSupplies", moveId] })
      queryClient.invalidateQueries({ queryKey: ["supplies"] })
      toast.success("Supply removed successfully")
    },
    onError: () => {
      toast.error("Failed to remove supply")
    },
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Allocated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {supplies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No supplies allocated
              </TableCell>
            </TableRow>
          ) : (
            supplies.map((moveSupply) => (
              <TableRow key={`${moveSupply.moveId}-${moveSupply.supplyId}`}>
                <TableCell>{moveSupply.supply?.name}</TableCell>
                <TableCell>{moveSupply.supply?.category}</TableCell>
                <TableCell>{moveSupply.supply?.unit}</TableCell>
                <TableCell>{moveSupply.quantity}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeMutation.mutate(moveSupply.supplyId)}
                    disabled={removeMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 