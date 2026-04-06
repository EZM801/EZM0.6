import { useQuery } from '@tanstack/react-query';

interface Item {
  id: string;
  name: string;
  description: string | null;
  category: string;
  type: string;
  weight: number | null;
  isFragile: boolean;
  specialInstructions: string | null;
  packingStatus: string | null;
  itemListId: string;
  originRoomId: string | null;
  destinationRoomId: string | null;
  originRoom: { id: string; name: string } | null;
  destinationRoom: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export function useItems(moveId: string, itemListId: string) {
  return useQuery<Item[]>({
    queryKey: ['items', moveId, itemListId],
    queryFn: async () => {
      const response = await fetch(`/api/moves/${moveId}/item-lists/${itemListId}/items`);
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      return data.data;
    },
  });
} 