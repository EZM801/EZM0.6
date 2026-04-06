import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Room } from '@/types/layout';

interface RoomResponse {
  success: boolean;
  data?: Room | Room[];
  error?: {
    message: string;
    details?: unknown;
  };
}

export const useRooms = () => {
  const queryClient = useQueryClient();

  const getRooms = async (layoutId: string): Promise<Room[]> => {
    const response = await fetch(`/api/layouts/${layoutId}/rooms`);
    if (!response.ok) {
      throw new Error('Failed to fetch rooms');
    }
    const result: RoomResponse = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to fetch rooms');
    }
    return Array.isArray(result.data) ? result.data : [result.data];
  };

  const createRoom = async (layoutId: string, data: Partial<Room>): Promise<Room> => {
    const response = await fetch(`/api/layouts/${layoutId}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create room');
    }
    const result: RoomResponse = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to create room');
    }
    return result.data as Room;
  };

  const updateRoom = async (layoutId: string, roomId: string, data: Partial<Room>): Promise<Room> => {
    const response = await fetch(`/api/layouts/${layoutId}/rooms/${roomId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update room');
    }
    const result: RoomResponse = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to update room');
    }
    return result.data as Room;
  };

  const deleteRoom = async (layoutId: string, roomId: string): Promise<void> => {
    const response = await fetch(`/api/layouts/${layoutId}/rooms/${roomId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete room');
    }
    const result: RoomResponse = await response.json();
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to delete room');
    }
  };

  return {
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom,
  };
}; 