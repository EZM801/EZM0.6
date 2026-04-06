import { useQuery } from "@tanstack/react-query"

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'normal' | 'high'
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export function useTasks(moveId: string) {
  return useQuery({
    queryKey: ['tasks', moveId],
    queryFn: async () => {
      const response = await fetch(`/api/moves/my/${moveId}/tasks`)
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      const data = await response.json()
      return data.tasks as Task[]
    },
    retry: 3,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
} 