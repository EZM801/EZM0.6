export type ItemImage = {
  url: string
  description?: string | null
  mimeType: string
  size: number
  isPrimary: boolean
}

export type Room = {
  id: string
  name: string
}

export type Item = {
  id: string
  name: string
  description: string | null
  category: string | null
  type: string | null
  weight: number | null
  value: number | null
  isFragile: boolean
  specialInstructions: string | null
  packingStatus: string | null
  originRoomId: string | null
  destinationRoomId: string | null
  stopRoomId: string | null
  itemListId: string
  moveId: string | null
  moveStopId: string | null
  originRoom: Room | null
  destinationRoom: Room | null
  stopRoom: Room | null
  createdAt: string
  updatedAt: string
  image: ItemImage | null
  qrCode: string | null
} 