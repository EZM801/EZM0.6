"use client"

import { AddVehicleDialog } from "@/app/dashboard/company/moves/components/add-vehicle-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { Vehicle } from "@prisma/client"
import { DataTable } from "@/app/components/ui/data-table"
import { columns } from "./columns"

interface VehiclesResponse {
  success: boolean
  data: Vehicle[]
}

export default function VehiclesPage() {
  const { data: response, isLoading } = useQuery<VehiclesResponse>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const response = await fetch("/api/company/vehicles")
      if (!response.ok) {
        throw new Error("Failed to fetch vehicles")
      }
      return response.json()
    }
  })

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Vehicles</CardTitle>
          <AddVehicleDialog />
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns}
            data={response?.data || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
} 