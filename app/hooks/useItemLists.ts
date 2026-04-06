import { useQuery } from '@tanstack/react-query';
import { ItemListType } from '@/app/types/ItemListType';

interface ApiResponse {
  success: boolean;
  data: ItemListType[];
  error?: { message: string };
}

async function fetchItemLists(moveId: string): Promise<ItemListType[]> {
  const response = await fetch(`/api/moves/${moveId}/item-lists`);
  const data: ApiResponse = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || 'Failed to fetch item lists');
  }
  
  return data.data;
}

export function useItemLists(moveId: string) {
  return useQuery({
    queryKey: ['itemLists', moveId],
    queryFn: () => fetchItemLists(moveId),
  });
} 