"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Layout, CreateLayoutRequest } from "@/app/types/LayoutType"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

interface LayoutManagerProps {
  moveId: string
}

export function LayoutManager({ moveId }: LayoutManagerProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [newLayout, setNewLayout] = useState<CreateLayoutRequest>({
    name: "",
    orientation: "origin",
    instructions: ""
  })

  // Fetch layouts
  const { data: layouts, isLoading } = useQuery({
    queryKey: ["layouts", moveId],
    queryFn: async () => {
      const response = await fetch(`/api/moves/${moveId}/layouts`)
      if (!response.ok) throw new Error("Failed to fetch layouts")
      const result = await response.json()
      return result.data
    }
  })

  // Create layout mutation
  const createLayoutMutation = useMutation({
    mutationFn: async (layout: CreateLayoutRequest) => {
      const response = await fetch(`/api/moves/${moveId}/layouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(layout)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || "Failed to create layout")
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["layouts", moveId] })
      toast.success("Layout created successfully")
      setIsCreating(false)
      setNewLayout({ name: "", orientation: "origin", instructions: "" })
      router.push(`/dashboard/move/${moveId}/layout/${data.data.id}`)
    }
  })

  const handleCreateLayout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLayout.name.trim()) {
      toast.error("Please enter a layout name")
      return
    }
    createLayoutMutation.mutate(newLayout)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // If no layouts exist, show create form
  if (!layouts?.length && !isCreating) {
    return (
      <div className="grid gap-6">
        <Card className="text-center p-6">
          <CardHeader>
            <CardTitle>No Layouts Created</CardTitle>
            <CardDescription>Create a layout to start planning your move</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Layout
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show create form
  if (isCreating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Layout</CardTitle>
          <CardDescription>Add a layout to plan your move</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateLayout} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Layout Name</Label>
              <Input
                id="name"
                value={newLayout.name}
                onChange={(e) => setNewLayout({ ...newLayout, name: e.target.value })}
                placeholder="e.g., Current Home Layout"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instructions">Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                value={newLayout.instructions}
                onChange={(e) => setNewLayout({ ...newLayout, instructions: e.target.value })}
                placeholder="Add any special instructions for this layout"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createLayoutMutation.isPending}>
                {createLayoutMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Create Layout
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  // Show existing layouts
  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Layouts</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Layout
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {layouts.map((layout: Layout) => (
          <Card 
            key={layout.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/dashboard/move/${moveId}/layout/${layout.id}`)}
          >
            <CardHeader>
              <CardTitle>{layout.name}</CardTitle>
              <CardDescription>
                {layout.orientation === "origin" ? "Origin Layout" : 
                 layout.orientation === "destination" ? "Destination Layout" : 
                 "Stop Layout"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {layout.rooms.length} room{layout.rooms.length !== 1 ? 's' : ''}
              </p>
              {layout.instructions && (
                <p className="text-sm mt-2">{layout.instructions}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 