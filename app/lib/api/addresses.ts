import { AddressType, CreateAddressInput, UpdateAddressInput } from '@/app/types/AddressType';

const API_BASE_URL = '/api';

export const addressesApi = {
  // Get all addresses
  getAllAddresses: async (): Promise<AddressType[]> => {
    const response = await fetch(`${API_BASE_URL}/addresses`);
    if (!response.ok) {
      throw new Error('Failed to fetch addresses');
    }
    return response.json();
  },

  // Get a specific address
  getAddress: async (id: string): Promise<AddressType> => {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }
    return response.json();
  },

  // Create a new address
  createAddress: async (data: CreateAddressInput): Promise<AddressType> => {
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create address');
    }
    return response.json();
  },

  // Update an address
  updateAddress: async (id: string, data: UpdateAddressInput): Promise<AddressType> => {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update address');
    }
    return response.json();
  },

  // Delete an address
  deleteAddress: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete address');
    }
  },
}; 