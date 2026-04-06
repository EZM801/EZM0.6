export interface MoveStopType {
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
    hasElevator?: boolean;
    floorNumber?: number | null;
    specialInstructions?: string | null;
  } | null;
}

export interface CreateMoveStopInput {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  arrivalDate?: Date | null;
  departureDate?: Date | null;
  notes?: string | null;
  addressDetails?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    hasElevator?: boolean;
    floorNumber?: number | null;
    specialInstructions?: string | null;
  };
}

export interface UpdateMoveStopInput {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  arrivalDate?: Date | null;
  departureDate?: Date | null;
  notes?: string | null;
  addressDetails?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    hasElevator?: boolean;
    floorNumber?: number | null;
    specialInstructions?: string | null;
  };
} 