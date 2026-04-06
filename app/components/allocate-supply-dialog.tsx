"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface Move {
  id: string
  title: string
}

interface AllocateSupplyDialogProps {
  supplyId: string
  supplyName: string
  availableQuantity: number
  moves: Move[]
  onAllocate: (moveId: string, quantity: number) => Promise<void>
}

export function AllocateSupplyDialog({
  supplyId,
  supplyName,
  availableQuantity,
  moves,
  onAllocate,
}: AllocateSupplyDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMoveId, setSelectedMoveId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const queryClient = useQueryClient()

  const allocateMutation = useMutation({
    mutationFn: async ({ moveId, quantity }: { moveId: string; quantity: number }) => {
      await onAllocate(moveId, quantity)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplies"] })
      setIsOpen(false)
      setSelectedMoveId("")
      setQuantity(1)
      toast.success("Supply allocated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to allocate supply")
    },
  })

  const handleAllocate = () => {
    if (!selectedMoveId) {
      toast.error("Please select a move")
      return
    }

    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0")
      return
    }

    if (quantity > availableQuantity) {
      toast.error(`Cannot allocate more than ${availableQuantity} units`)
      return
    }

    allocateMutation.mutate({ moveId: selectedMoveId, quantity })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Allocate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Allocate {supplyName}</DialogTitle>
          <DialogDescription>
            Allocate this supply to a move. Available quantity: {availableQuantity}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="move">Move</Label>
            <Select value={selectedMoveId} onValueChange={setSelectedMoveId}>
              <SelectTrigger id="move">
                <SelectValue placeholder="Select a move" />
              </SelectTrigger>
              <SelectContent>
                {moves.map((move) => (
                  <SelectItem key={move.id} value={move.id}>
                    {move.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={availableQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAllocate} disabled={allocateMutation.isPending}>
            {allocateMutation.isPending ? "Allocating..." : "Allocate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 