export interface AddressType {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressInput {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UpdateAddressInput {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
} 