import { useQuery } from '@tanstack/react-query';
import { ItemListType } from '@/app/types/ItemListType';

interface ApiResponse {
  success: boolean;
  data: ItemListType;
  error?: { message: string };
}

async function fetchItemList(moveId: string, itemListId: string): Promise<ItemListType> {
  const response = await fetch(`/api/moves/my/${moveId}/item-lists/${itemListId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch item list');
  }
  const data = await response.json();
  if (!data.data) {
    throw new Error('No data returned from server');
  }
  return data.data;
}

export function useItemList(moveId: string, itemListId: string) {
  return useQuery({
    queryKey: ['itemList', moveId, itemListId],
    queryFn: () => fetchItemList(moveId, itemListId),
    retry: false,
  });
} 