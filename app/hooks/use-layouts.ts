import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Layout } from '@/types/layout'

interface LayoutResponse {
  success: boolean
  data?: Layout | Layout[]
  error?: {
    message: string
    details?: unknown
  }
}

interface Room {
  id: string
  name: string
  width: number
  height: number
}

interface CreateLayoutRequest {
  name: string
  orientation: "origin" | "destination" | "stop"
  instructions?: string | null
  moveId: string
}

interface CreateRoomInput {
  name: string
  layoutId: string
}

export const useLayouts = () => {
  const queryClient = useQueryClient()

  // Get all layouts for a move
  const useLayoutsQuery = (moveId: string) => {
    return useQuery({
      queryKey: ['layouts', moveId],
      queryFn: async () => {
        const response = await fetch(`/api/moves/${moveId}/layouts?include=rooms`)
        if (!response.ok) {
          throw new Error('Failed to fetch layouts')
        }
        const result: LayoutResponse = await response.json()
        if (!result.success || !result.data) {
          throw new Error(result.error?.message || 'Failed to fetch layouts')
        }
        return Array.isArray(result.data) ? result.data : [result.data]
      }
    })
  }

  // Get a single layout
  const useLayoutQuery = (moveId: string, layoutId: string) => {
    return useQuery({
      queryKey: ['layout', moveId, layoutId],
      queryFn: async () => {
        const response = await fetch(`/api/moves/${moveId}/layouts/${layoutId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch layout')
        }
        const result: LayoutResponse = await response.json()
        if (!result.success || !result.data) {
          throw new Error(result.error?.message || 'Failed to fetch layout')
        }
        return result.data as Layout
      },
      enabled: !!moveId && !!layoutId
    })
  }

  // Create layout mutation
  const useCreateLayoutMutation = () => {
    return useMutation({
      mutationFn: async (data: CreateLayoutRequest) => {
        const response = await fetch(`/api/moves/${data.moveId}/layouts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            orientation: data.orientation,
            instructions: data.instructions || null
          }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || 'Failed to create layout')
        }
        
        const result = await response.json()
        if (!result.success || !result.data) {
          throw new Error(result.error?.message || 'Failed to create layout')
        }
        
        return result.data
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['layouts', variables.moveId] })
        toast.success('Layout created successfully')
      },
      onError: (error) => {
        console.error('Error creating layout:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to create layout')
      }
    })
  }

  // Update layout mutation
  const useUpdateLayoutMutation = () => {
    return useMutation({
      mutationFn: async ({ moveId, layoutId, data }: { moveId: string; layoutId: string; data: Partial<Layout> }) => {
        const response = await fetch(`/api/moves/${moveId}/layouts/${layoutId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        
        const result: LayoutResponse = await response.json()
        
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.error?.message || 'Failed to update layout')
        }
        
        return result.data as Layout
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['layouts', variables.moveId] })
        queryClient.invalidateQueries({ queryKey: ['layout', variables.moveId, variables.layoutId] })
        toast.success('Layout updated successfully')
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to update layout')
      }
    })
  }

  // Delete layout mutation
  const useDeleteLayoutMutation = () => {
    return useMutation({
      mutationFn: async ({ moveId, layoutId }: { moveId: string; layoutId: string }) => {
        const response = await fetch(`/api/moves/${moveId}/layouts?layoutId=${layoutId}`, {
          method: 'DELETE',
        })
        
        const result: LayoutResponse = await response.json()
        
        if (!response.ok || !result.success) {
          throw new Error(result.error?.message || 'Failed to delete layout')
        }
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['layouts', variables.moveId] })
        toast.success('Layout deleted successfully')
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to delete layout')
      }
    })
  }

  return {
    useLayoutsQuery,
    useLayoutQuery,
    useCreateLayoutMutation,
    useUpdateLayoutMutation,
    useDeleteLayoutMutation
  }
}

export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateRoomInput) => {
      const response = await fetch(`/api/layouts/${input.layoutId}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        throw new Error("Failed to create room")
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["layouts"] })
      toast.success("Room created successfully")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create room")
    },
  })
} 