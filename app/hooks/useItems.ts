import { useQuery } from "@tanstack/react-query"
import type { Item } from "@/app/types/item"

type ItemImage = {
  url: string
  description?: string
  mimeType: string
  size: number
  isPrimary: boolean
}

type Room = {
  id: string
  name: string
}

export function useItems(moveId: string, itemListId: string) {
  return useQuery<Item[]>({
    queryKey: ['items', moveId, itemListId],
    queryFn: async () => {
      const response = await fetch(`/api/moves/${moveId}/item-lists/${itemListId}/items`)
      if (!response.ok) {
        throw new Error('Failed to fetch items')
      }
      const result = await response.json()
      return result.data
    }
  })
} 