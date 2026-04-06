import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateItemInput } from '@/app/types/ItemType';

interface UseItemActionsProps {
  moveId: string;
  itemListId: string;
}

export function useItemActions({ moveId, itemListId }: UseItemActionsProps) {
  const queryClient = useQueryClient();

  const updateItem = useMutation({
    mutationFn: async ({ itemId, data }: { itemId: string; data: UpdateItemInput }) => {
      const response = await fetch(`/api/moves/${moveId}/item-lists/${itemListId}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update item');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itemList', moveId, itemListId] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/moves/${moveId}/item-lists/${itemListId}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete item');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itemList', moveId, itemListId] });
    },
  });

  return {
    updateItem,
    deleteItem,
  };
} 