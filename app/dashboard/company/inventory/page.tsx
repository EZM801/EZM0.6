"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { columns as equipmentColumns } from "./components/equipment-columns"
import { columns as suppliesColumns } from "./components/supplies-columns"

async function fetchEquipment() {
  const response = await fetch("/api/company/equipment")
  if (!response.ok) throw new Error("Failed to fetch equipment")
  const data = await response.json()
  return data
}

async function fetchSupplies() {
  const response = await fetch("/api/company/supplies")
  if (!response.ok) throw new Error("Failed to fetch supplies")
  const data = await response.json()
  return data
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("equipment")

  const { data: equipmentData, isLoading: isLoadingEquipment } = useQuery({
    queryKey: ["equipment"],
    queryFn: fetchEquipment
  })

  const { data: suppliesData, isLoading: isLoadingSupplies } = useQuery({
    queryKey: ["supplies"],
    queryFn: fetchSupplies
  })

  const equipment = equipmentData?.data || []
  const supplies = suppliesData?.data || []

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="supplies">Supplies</TabsTrigger>
            </TabsList>
            <TabsContent value="equipment">
              <DataTable
                columns={equipmentColumns}
                data={equipment}
                isLoading={isLoadingEquipment}
              />
            </TabsContent>
            <TabsContent value="supplies">
              <DataTable
                columns={suppliesColumns}
                data={supplies}
                isLoading={isLoadingSupplies}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 