"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  moveId: string
}

export function CreateTaskModal({ open, onOpenChange, moveId }: CreateTaskModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/company/moves/${moveId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          priority,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create task")
      }

      onOpenChange(false)
      setName("")
      setDescription("")
      setPriority("MEDIUM")
    } catch (error) {
      console.error("Error creating task:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value: "LOW" | "MEDIUM" | "HIGH") => setPriority(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Create Task</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 