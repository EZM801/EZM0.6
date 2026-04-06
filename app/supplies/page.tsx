"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Box, Edit, Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { AllocateSupplyDialog } from "../components/allocate-supply-dialog"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface Supply {
  id: string
  name: string
  description: string | null
  category: string
  unit: string
  quantityInStock: number
  reorderPoint: number
  isActive: boolean
}

interface MoveSupply {
  id: string
  moveId: string
  supplyId: string
  quantity: number
  supply: Supply
}

interface Move {
  id: string
  title: string
}

export default function SuppliesPage() {
  const queryClient = useQueryClient()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newSupply, setNewSupply] = useState({
    name: "",
    description: "",
    category: "",
    unit: "boxes",
    quantityInStock: 0,
    reorderPoint: 10,
  })

  // Fetch supplies
  const { data: supplies = [], isLoading: isLoadingSupplies } = useQuery({
    queryKey: ["supplies"],
    queryFn: async () => {
      const response = await fetch("/api/supplies")
      if (!response.ok) throw new Error("Failed to fetch supplies")
      const { data } = await response.json()
      if (!data) throw new Error("No supplies data found")
      return data
    },
  })

  // Fetch moves
  const { data: moves = [], isLoading: isLoadingMoves } = useQuery({
    queryKey: ["moves"],
    queryFn: async () => {
      const response = await fetch("/api/moves")
      if (!response.ok) throw new Error("Failed to fetch moves")
      const { data } = await response.json()
      return data || []
    },
  })

  // Add supply mutation
  const addSupplyMutation = useMutation({
    mutationFn: async (supply: Omit<Supply, "id" | "isActive">) => {
      const response = await fetch("/api/supplies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supply),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add supply")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplies"] })
      setNewSupply({
        name: "",
        description: "",
        category: "",
        unit: "boxes",
        quantityInStock: 0,
        reorderPoint: 10,
      })
      setIsAddDialogOpen(false)
      toast.success("Supply added successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Delete supply mutation
  const deleteSupplyMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/supplies?id=${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete supply")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplies"] })
      toast.success("Supply deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete supply")
    },
  })

  const handleAddSupply = () => {
    if (!newSupply.name || !newSupply.category || !newSupply.unit) {
      toast.error("Please fill in all required fields")
      return
    }

    addSupplyMutation.mutate({
      name: newSupply.name,
      description: newSupply.description || null,
      category: newSupply.category,
      unit: newSupply.unit,
      quantityInStock: Number(newSupply.quantityInStock),
      reorderPoint: Number(newSupply.reorderPoint),
    })
  }

  const handleDelete = (id: string) => {
    deleteSupplyMutation.mutate(id)
  }

  const handleAllocate = async (moveId: string, quantity: number, supplyId: string) => {
    try {
      const response = await fetch(`/api/moves/my/${moveId}/supplies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplyId, quantity }),
      })

      if (!response.ok) throw new Error("Failed to allocate supply")

      queryClient.invalidateQueries({ queryKey: ["supplies"] })
      toast.success("Supply allocated successfully")
    } catch (error) {
      console.error("Error allocating supply:", error)
      toast.error("Failed to allocate supply")
      throw error
    }
  }

  if (isLoadingSupplies || isLoadingMoves) {
    return <div>Loading...</div>
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Supplies</h1>
            <p className="text-muted-foreground">Manage your moving supplies inventory</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Supply
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Supply</DialogTitle>
                <DialogDescription>
                  Add a new supply to your inventory
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newSupply.name}
                    onChange={(e) => setNewSupply({ ...newSupply, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newSupply.description}
                    onChange={(e) => setNewSupply({ ...newSupply, description: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newSupply.category}
                    onChange={(e) => setNewSupply({ ...newSupply, category: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={newSupply.unit}
                    onValueChange={(value) => setNewSupply({ ...newSupply, unit: value })}
                  >
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boxes">Boxes</SelectItem>
                      <SelectItem value="rolls">Rolls</SelectItem>
                      <SelectItem value="sheets">Sheets</SelectItem>
                      <SelectItem value="pieces">Pieces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Initial Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={newSupply.quantityInStock}
                    onChange={(e) => setNewSupply({ ...newSupply, quantityInStock: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reorderPoint">Reorder Point</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    min="0"
                    value={newSupply.reorderPoint}
                    onChange={(e) => setNewSupply({ ...newSupply, reorderPoint: Number(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSupply} disabled={addSupplyMutation.isPending}>
                  {addSupplyMutation.isPending ? "Adding..." : "Add Supply"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="allocated">Allocated</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {supplies.map((supply: Supply) => (
              <Card key={supply.id}>
                <CardHeader>
                  <CardTitle>{supply.name}</CardTitle>
                  <CardDescription>{supply.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <span className="font-medium">{supply.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Unit</span>
                      <span className="font-medium">{supply.unit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">In Stock</span>
                      <span className="font-medium">{supply.quantityInStock}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Reorder Point</span>
                      <span className="font-medium">{supply.reorderPoint}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <AllocateSupplyDialog
                    supplyId={supply.id}
                    supplyName={supply.name}
                    availableQuantity={supply.quantityInStock}
                    moves={moves}
                    onAllocate={(moveId, quantity) => handleAllocate(moveId, quantity, supply.id)}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(supply.id)}
                    disabled={deleteSupplyMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="allocated">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Allocated supplies will be shown here */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

