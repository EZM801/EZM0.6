"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Package, ShoppingCart } from "lucide-react"
import { OrderSupplyDialog } from "./components/order-supply-dialog"
import { AllocateSupplyDialog } from "./components/allocate-supply-dialog"
import { SupplyList } from "./components/supply-list"
import { AllocatedSupplyList } from "./components/allocated-supply-list"
import { toast } from "sonner"
import { useState } from "react"

interface Supply {
  id: string
  name: string
  description: string | null
  quantityInStock: number
  price: number
  unit: string
}

interface MoveSupply {
  id: string
  supplyId: string
  quantity: number
  assignedAt: Date
  supply: Supply
}

export default function MoveSuppliesPage() {
  const { id: moveId } = useParams()
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [showAllocateDialog, setShowAllocateDialog] = useState(false)

  // Fetch move supplies
  const { data: moveSupplies, isLoading: isLoadingMoveSupplies } = useQuery({
    queryKey: ["moveSupplies", moveId],
    queryFn: async () => {
      const response = await fetch(`/api/moves/my/${moveId}/supplies`)
      if (!response.ok) {
        throw new Error("Failed to fetch move supplies")
      }
      return response.json()
    },
  })

  // Fetch available supplies
  const { data: availableSupplies, isLoading: isLoadingAvailableSupplies } = useQuery({
    queryKey: ["availableSupplies"],
    queryFn: async () => {
      const response = await fetch("/api/supplies")
      if (!response.ok) {
        throw new Error("Failed to fetch available supplies")
      }
      const data = await response.json()
      if (!data.success) {
        throw new Error("Failed to fetch available supplies")
      }
      return data.data || []
    },
  })

  if (isLoadingMoveSupplies || isLoadingAvailableSupplies) {
    return <div>Loading...</div>
  }

  const moveSuppliesData = moveSupplies?.data || []
  const availableSuppliesData = availableSupplies || []

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Supplies</h1>
        <p className="text-muted-foreground">Manage supplies for your move</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-none rounded-3xl soft-shadow">
            <CardHeader>
              <CardTitle>Order New Supplies</CardTitle>
              <CardDescription>
                Order new supplies for your move
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="rounded-full bg-gradient-to-r from-gradient-start to-gradient-mid p-4">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-medium">Order Supplies</h3>
              <p className="mb-4 mt-2 text-center text-sm text-muted-foreground">
                Order new supplies for your move
              </p>
              <Button onClick={() => setShowOrderDialog(true)} className="rounded-full">
                <Plus className="mr-2 h-4 w-4" /> Order Supplies
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none rounded-3xl soft-shadow">
            <CardHeader>
              <CardTitle>Allocate Existing Supplies</CardTitle>
              <CardDescription>
                Allocate supplies from your inventory
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="rounded-full bg-gradient-to-r from-gradient-start to-gradient-mid p-4">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-medium">Allocate Supplies</h3>
              <p className="mb-4 mt-2 text-center text-sm text-muted-foreground">
                Allocate supplies from your existing inventory
              </p>
              <Button onClick={() => setShowAllocateDialog(true)} className="rounded-full">
                <Plus className="mr-2 h-4 w-4" /> Allocate Supplies
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="allocated" className="space-y-4">
          <TabsList>
            <TabsTrigger value="allocated">Allocated Supplies</TabsTrigger>
            <TabsTrigger value="available">Available Supplies</TabsTrigger>
          </TabsList>

          <TabsContent value="allocated">
            <Card>
              <CardHeader>
                <CardTitle>Allocated Supplies</CardTitle>
                <CardDescription>
                  Supplies that have been allocated to this move
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AllocatedSupplyList supplies={moveSuppliesData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="available">
            <Card>
              <CardHeader>
                <CardTitle>Available Supplies</CardTitle>
                <CardDescription>
                  Supplies available for allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SupplyList supplies={availableSuppliesData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <OrderSupplyDialog
        open={showOrderDialog}
        onOpenChange={setShowOrderDialog}
        moveId={moveId as string}
      />

      <AllocateSupplyDialog
        open={showAllocateDialog}
        onOpenChange={setShowAllocateDialog}
        moveId={moveId as string}
        supplies={availableSuppliesData}
      />
    </div>
  )
} 