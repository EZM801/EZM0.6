import { MoveStatus, MoveType } from './MoveType'
import { AddressType } from './AddressType'
import { MoveStopType } from './MoveStopType'
import { ItemListType } from './ItemListType'
import { ItemType } from './ItemType'

// Common API Types
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Move API Types
export interface CreateMoveRequest {
  title: string
  description?: string
  status: MoveStatus
  moveType: MoveType
  startDate?: string
  endDate?: string
  fromAddressId?: string
  toAddressId?: string
  fromAddress?: Omit<AddressType, 'id' | 'createdAt' | 'updatedAt'>
  toAddress?: Omit<AddressType, 'id' | 'createdAt' | 'updatedAt'>
}

export interface UpdateMoveRequest extends Partial<CreateMoveRequest> {
  id: string
}

// MoveStop API Types
export interface CreateMoveStopRequest {
  moveId: string
  addressId?: string
  address?: Omit<AddressType, 'id' | 'createdAt' | 'updatedAt'>
  stopOrder: number
  estimatedDuration: number
  notes?: string
}

export interface UpdateMoveStopRequest extends Partial<CreateMoveStopRequest> {
  id: string
}

// ItemList API Types
export interface CreateItemListRequest {
  moveId: string
  name: string
  description?: string
}

export interface UpdateItemListRequest extends Partial<CreateItemListRequest> {
  id: string
}

// Item API Types
export interface CreateItemRequest {
  itemListId: string
  name: string
  description?: string
  quantity: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  weight?: number
  specialInstructions?: string
}

export interface UpdateItemRequest extends Partial<CreateItemRequest> {
  id: string
}

// Address API Types
export interface CreateAddressRequest {
  street: string
  city: string
  state: string
  zipCode: string
  hasElevator?: boolean
  floorNumber?: number
  specialInstructions?: string
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
  id: string
} 