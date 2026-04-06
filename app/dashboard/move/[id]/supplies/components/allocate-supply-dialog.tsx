"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Supply } from "../types"
import { toast } from "sonner"

interface AllocateSupplyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  moveId: string
  supplies: Supply[]
}

export function AllocateSupplyDialog({ open, onOpenChange, moveId, supplies }: AllocateSupplyDialogProps) {
  const queryClient = useQueryClient()
  const [selectedSupplyId, setSelectedSupplyId] = useState("")
  const [quantity, setQuantity] = useState(1)

  const allocateSupplyMutation = useMutation({
    mutationFn: async (data: { supplyId: string; quantity: number }) => {
      const response = await fetch(`/api/moves/${moveId}/supplies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to allocate supply")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moveSupplies", moveId] })
      queryClient.invalidateQueries({ queryKey: ["supplies"] })
      setSelectedSupplyId("")
      setQuantity(1)
      onOpenChange(false)
      toast.success("Supply allocated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupplyId) {
      toast.error("Please select a supply")
      return
    }
    allocateSupplyMutation.mutate({ supplyId: selectedSupplyId, quantity })
  }

  const selectedSupply = supplies.find((s) => s.id === selectedSupplyId)
  const maxQuantity = selectedSupply?.quantityInStock || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Allocate Supply</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supply">Supply</Label>
            <Select value={selectedSupplyId} onValueChange={setSelectedSupplyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a supply" />
              </SelectTrigger>
              <SelectContent>
                {supplies.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No supplies available
                  </div>
                ) : (
                  supplies.map((supply) => (
                    <SelectItem key={supply.id} value={supply.id}>
                      {supply.name} ({supply.quantityInStock} {supply.unit} available)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {supplies.length === 0 && (
              <p className="text-sm text-muted-foreground">
                You don't have any supplies available. Please add supplies first.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              required
              disabled={!selectedSupplyId}
            />
            {selectedSupply && (
              <p className="text-sm text-muted-foreground">
                {maxQuantity} {selectedSupply.unit} available
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={allocateSupplyMutation.isPending || !selectedSupplyId || supplies.length === 0}
            >
              {allocateSupplyMutation.isPending ? "Allocating..." : "Allocate Supply"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 