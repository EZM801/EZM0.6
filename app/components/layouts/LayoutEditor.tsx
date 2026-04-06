"use client"

import { useState, useRef, useEffect } from "react"
import { Room } from "@/app/types/LayoutType"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RoomEditor } from "./RoomEditor"

interface LayoutEditorProps {
  rooms: Room[]
  layoutId: string
}

export function LayoutEditor({ rooms, layoutId }: LayoutEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room)
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedRoom(null)
    }
  }

  const handleDragStart = (e: React.MouseEvent, room: Room) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - (room.x || 0),
      y: e.clientY - (room.y || 0),
    })
  }

  const handleDrag = (e: React.MouseEvent, room: Room) => {
    if (!isDragging) return

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    // Update room position
    const updatedRoom = {
      ...room,
      x: newX,
      y: newY,
    }

    // TODO: Update room position in database
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div className="flex gap-4">
      <Card className="flex-1">
        <CardContent className="p-4">
          <div
            ref={canvasRef}
            className="relative w-full h-[600px] border rounded-lg bg-gray-50"
            onClick={handleCanvasClick}
          >
            {rooms.map((room) => (
              <div
                key={room.id}
                className="absolute border rounded-lg bg-white p-2 cursor-move"
                style={{
                  width: `${room.width * 20}px`,
                  height: `${room.height * 20}px`,
                  left: `${room.x || 0}px`,
                  top: `${room.y || 0}px`,
                  transform: `scale(${scale})`,
                }}
                onClick={() => handleRoomClick(room)}
                onMouseDown={(e) => handleDragStart(e, room)}
                onMouseMove={(e) => handleDrag(e, room)}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                <div className="text-sm font-medium">{room.name}</div>
                <div className="text-xs text-muted-foreground">
                  {room.width}ft x {room.height}ft
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedRoom && (
        <div className="w-80">
          <RoomEditor
            room={selectedRoom}
            layoutId={layoutId}
            onClose={() => setSelectedRoom(null)}
          />
        </div>
      )}
    </div>
  )
} 