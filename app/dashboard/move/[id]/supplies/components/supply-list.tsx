"use client"

import { Supply } from "../types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface SupplyListProps {
  supplies: Supply[]
}

export function SupplyList({ supplies }: SupplyListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>In Stock</TableHead>
            <TableHead>Reorder Point</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {supplies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No supplies found
              </TableCell>
            </TableRow>
          ) : (
            supplies.map((supply) => (
              <TableRow key={supply.id}>
                <TableCell>{supply.name}</TableCell>
                <TableCell>{supply.category}</TableCell>
                <TableCell>{supply.unit}</TableCell>
                <TableCell>{supply.quantityInStock}</TableCell>
                <TableCell>{supply.reorderPoint}</TableCell>
                <TableCell>
                  <Badge variant={supply.quantityInStock <= supply.reorderPoint ? "destructive" : "default"}>
                    {supply.quantityInStock <= supply.reorderPoint ? "Low Stock" : "In Stock"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 