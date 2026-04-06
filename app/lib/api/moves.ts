import { CreateMoveInput, Move, UpdateMoveInput } from '@/app/types/MoveType';

const API_BASE_URL = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
}

export const movesApi = {
  // Get all moves
  getAllMoves: async (): Promise<Move[]> => {
    const response = await fetch(`${API_BASE_URL}/moves`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch moves');
    }
    const result: ApiResponse<Move[]> = await response.json();
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch moves');
    }
    return result.data || [];
  },

  // Get a specific move
  getMove: async (id: string): Promise<Move> => {
    const response = await fetch(`${API_BASE_URL}/moves/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch move');
    }
    const result: ApiResponse<Move> = await response.json();
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch move');
    }
    return result.data!;
  },

  // Create a new move
  createMove: async (data: CreateMoveInput): Promise<Move> => {
    const response = await fetch(`${API_BASE_URL}/moves`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create move');
    }
    const result: ApiResponse<Move> = await response.json();
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to create move');
    }
    return result.data!;
  },

  // Update a move
  updateMove: async (id: string, data: UpdateMoveInput): Promise<Move> => {
    const response = await fetch(`${API_BASE_URL}/moves/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to update move');
    }
    const result: ApiResponse<Move> = await response.json();
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to update move');
    }
    return result.data!;
  },

  // Delete a move
  deleteMove: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/moves/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete move');
    }
    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to delete move');
    }
  },
}; 