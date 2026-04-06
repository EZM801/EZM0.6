import { Layout } from './LayoutType';

export enum MoveStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum MoveType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  STORAGE = 'storage',
  PACKING = 'packing',
  UNPACKING = 'unpacking'
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  hasElevator?: boolean;
  floorNumber?: number | null;
  specialInstructions?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMoveInput {
  name: string;
  description?: string | null;
  moveType?: MoveType | null;
  startDate?: string | null;
  endDate?: string | null;
  fromAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    hasElevator?: boolean;
    floorNumber?: number | null;
    specialInstructions?: string | null;
  } | null;
  toAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    hasElevator?: boolean;
    floorNumber?: number | null;
    specialInstructions?: string | null;
  } | null;
  stops?: Array<{
    name?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    arrivalDate?: string | null;
    departureDate?: string | null;
    notes?: string | null;
  }>;
}

export interface UpdateMoveInput {
  name?: string;
  description?: string | null;
  status?: MoveStatus;
  moveType?: MoveType | null;
  startDate?: string | null;
  endDate?: string | null;
  fromAddressId?: string | null;
  toAddressId?: string | null;
}

export interface ItemList {
  id: string;
  name: string;
  description: string | null;
  items: Array<{
    id: string;
    name: string;
    description: string | null;
    photos: Array<{
      url: string;
      description: string | null;
      mimeType: string;
      size: number;
      isPrimary: boolean;
    }>;
    qrCodes: Array<{
      code: string;
    }>;
  }>;
}

export interface Move {
  id: string;
  name: string;
  description?: string | null;
  status: MoveStatus;
  moveType: MoveType | null;
  startDate?: Date | null;
  endDate?: Date | null;
  fromAddress?: Address | null;
  toAddress?: Address | null;
  fromAddressId?: string | null;
  toAddressId?: string | null;
  userId: string;
  companyId?: string | null;
  isTemplate: boolean;
  templateName?: string | null;
  templateCategory?: string | null;
  visibility: 'private' | 'public';
  layouts?: Layout[];
  itemLists?: ItemList[];
  stops?: Array<{
    id: string;
    moveId: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    arrivalDate?: Date | null;
    departureDate?: Date | null;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
    addressDetails?: {
      id: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      hasElevator: boolean;
      floorNumber: number | null;
      specialInstructions: string | null;
    } | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
} 