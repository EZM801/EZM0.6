import { useQuery } from '@tanstack/react-query'

interface Room {
  id: string;
  name: string;
  layoutId: string;
}

interface Layout {
  id: string;
  name: string;
  orientation: string;
  rooms: Room[];
}

export function useLayouts(moveId: string) {
  return useQuery<Layout[]>({
    queryKey: ['layouts', moveId],
    queryFn: async () => {
      const response = await fetch(`/api/moves/${moveId}/layouts`)
      if (!response.ok) {
        throw new Error('Failed to fetch layouts')
      }
      const data = await response.json()
      return data.data
    },
  })
} 