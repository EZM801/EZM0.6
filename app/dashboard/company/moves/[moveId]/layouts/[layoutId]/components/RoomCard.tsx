import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import React from "react"

export interface RoomCardProps {
  room: {
    id: string
    name: string
    description: string | null
  }
  onDelete?: (id: string) => void
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onDelete }) => {
  return (
    <Card
      className="border-none rounded-3xl soft-shadow hover:shadow-lg transition-all duration-200 group"
      tabIndex={0}
      aria-label={`Room: ${room.name}`}
      role="region"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{room.name}</CardTitle>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Delete Room"
              onClick={e => { e.stopPropagation(); onDelete(room.id) }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {room.description && (
          <CardDescription className="line-clamp-2">
            {room.description}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  )
} 