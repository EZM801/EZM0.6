export type LayoutType = "origin" | "destination" | "stop";

export interface Room {
  id: string
  name: string
  description?: string
  layoutId: string
  layoutType: "origin" | "destination" | "stop"
  width: number
  height: number
  createdAt: string
  updatedAt: string
}

export interface Layout {
  id: string
  name: string
  instructions?: string
  moveId: string
  moveStopId?: string
  orientation: "origin" | "destination" | "stop"
  createdAt: string
  updatedAt: string
  rooms: Room[]
}

export interface CreateLayoutRequest {
  name: string
  instructions?: string
  moveStopId?: string
  orientation: "origin" | "destination" | "stop"
}

export interface UpdateLayoutRequest {
  name?: string
  instructions?: string
  moveStopId?: string
  orientation?: "origin" | "destination" | "stop"
}

export interface CreateRoomRequest {
  name: string
  description?: string
  width: number
  height: number
}

export interface UpdateRoomRequest {
  name?: string
  description?: string
  width?: number
  height?: number
} 