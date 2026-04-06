import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2 } from 'lucide-react'

interface Room {
  id: string
  name: string
  description: string | null
}

interface RoomListProps {
  layoutId: string
}

export function RoomList({ layoutId }: RoomListProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const queryClient = useQueryClient()

  // Fetch rooms
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms', layoutId],
    queryFn: async () => {
      const response = await fetch(`/api/layouts/${layoutId}/rooms`)
      if (!response.ok) throw new Error('Failed to fetch rooms')
      return response.json() as Promise<Room[]>
    }
  })

  // Add room mutation
  const addRoom = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/layouts/${layoutId}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add room')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', layoutId] })
      toast.success('Room added successfully')
      setName('')
      setDescription('')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  // Remove room mutation
  const removeRoom = useMutation({
    mutationFn: async (roomId: string) => {
      const response = await fetch(`/api/layouts/${layoutId}/rooms/${roomId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to remove room')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', layoutId] })
      toast.success('Room removed successfully')
    },
    onError: () => {
      toast.error('Failed to remove room')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addRoom.mutate()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Rooms</CardTitle>
        <CardDescription>Manage rooms in this layout</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Room Name</Label>
            <Input
              id="name"
              placeholder="Enter room name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter room description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button 
            type="submit" 
            disabled={addRoom.isPending}
          >
            {addRoom.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add Room
          </Button>
        </form>

        <div className="mt-8 space-y-4">
          <h3 className="text-sm font-medium">Current Rooms</h3>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : rooms?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No rooms added yet
            </p>
          ) : (
            <div className="space-y-2">
              {rooms?.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{room.name}</p>
                    {room.description && (
                      <p className="text-sm text-muted-foreground">
                        {room.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRoom.mutate(room.id)}
                    disabled={removeRoom.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 