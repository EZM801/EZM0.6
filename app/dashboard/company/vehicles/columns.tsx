import { ColumnDef, Column } from "@tanstack/react-table"
import { Vehicle } from "@prisma/client"
import { Badge } from "@/app/components/ui/badge"
import { DataTableColumnHeader } from "@/app/components/ui/data-table-column-header"

export const columns: ColumnDef<Vehicle>[] = [
  {
    accessorKey: "name",
    header: ({ column }: { column: Column<Vehicle> }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }: { column: Column<Vehicle> }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
  },
  {
    accessorKey: "licensePlate",
    header: ({ column }: { column: Column<Vehicle> }) => (
      <DataTableColumnHeader column={column} title="License Plate" />
    ),
  },
  {
    accessorKey: "isActive",
    header: ({ column }: { column: Column<Vehicle> }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }: { row: any }) => {
      const isActive = row.getValue("isActive") as boolean
      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
] 