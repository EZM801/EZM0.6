import { useQuery } from '@tanstack/react-query';

async function fetchItem(moveId: string, itemListId: string, itemId: string) {
  const response = await fetch(`/api/company/moves/${moveId}/item-lists/${itemListId}/items/${itemId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch item');
  }
  
  const { data } = await response.json();
  return data;
}

export function useItem(moveId: string, itemListId: string, itemId: string) {
  return useQuery({
    queryKey: ['item', moveId, itemListId, itemId],
    queryFn: () => fetchItem(moveId, itemListId, itemId),
    enabled: !!moveId && !!itemListId && !!itemId,
  });
} 