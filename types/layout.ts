import { Layout as PrismaLayout, Room as PrismaRoom } from "@prisma/client"

// Frontend types that exactly match Prisma schema
export interface Layout extends PrismaLayout {
  rooms: Room[]
}

export type Room = PrismaRoom

// Type mapping functions
export const mapPrismaLayoutToFrontend = (layout: PrismaLayout & { rooms: PrismaRoom[] }): Layout => ({
  id: layout.id,
  name: layout.name,
  instructions: layout.instructions,
  moveId: layout.moveId,
  moveStopId: layout.moveStopId,
  orientation: layout.orientation,
  createdAt: layout.createdAt,
  updatedAt: layout.updatedAt,
  rooms: layout.rooms.map(mapPrismaRoomToFrontend)
})

export const mapPrismaRoomToFrontend = (room: PrismaRoom): Room => ({
  id: room.id,
  name: room.name,
  description: room.description,
  layoutId: room.layoutId,
  createdAt: room.createdAt,
  updatedAt: room.updatedAt
})

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
  }
}

// Request types
export interface CreateLayoutRequest {
  name: string
  moveId: string
  orientation: "origin" | "destination" | "stop"
  instructions?: string | null
}

export interface UpdateLayoutRequest {
  name?: string
  instructions?: string | null
  orientation?: "origin" | "destination" | "stop"
} 