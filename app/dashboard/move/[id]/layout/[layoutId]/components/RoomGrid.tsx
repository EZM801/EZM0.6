"use client"

import { Layout } from "@/types/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { CreateRoomDialog } from "./CreateRoomDialog"

interface RoomGridProps {
  layout: Layout
  onUpdateLayout: (data: Partial<Layout>) => Promise<void>
}

export function RoomGrid({ layout, onUpdateLayout }: RoomGridProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Rooms</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {layout.rooms.map((room) => (
          <Card key={room.id}>
            <CardHeader>
              <CardTitle>{room.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{room.instructions || "No instructions provided"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <CreateRoomDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        layoutId={layout.id}
        onRoomCreated={async (room) => {
          await onUpdateLayout({
            rooms: [...layout.rooms, room]
          })
        }}
      />
    </div>
  )
} 