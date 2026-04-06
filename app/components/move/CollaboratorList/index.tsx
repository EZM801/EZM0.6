import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, UserPlus, X, Users } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface Collaborator {
  id: string
  role: string
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  }
}

interface CollaboratorListProps {
  moveId: string
}

export function CollaboratorList({ moveId }: CollaboratorListProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('viewer')
  const queryClient = useQueryClient()

  // Fetch collaborators
  const { data: collaborators, isLoading } = useQuery<Collaborator[]>({
    queryKey: ['collaborators', moveId],
    queryFn: async () => {
      const response = await fetch(`/api/moves/${moveId}/collaborators`)
      if (!response.ok) {
        throw new Error('Failed to fetch collaborators')
      }
      return response.json()
    },
  })

  // Add collaborator mutation
  const addCollaborator = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/moves/${moveId}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add collaborator')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', moveId] })
      toast.success('Collaborator added successfully')
      setEmail('')
      setRole('viewer')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Remove collaborator mutation
  const removeCollaborator = useMutation({
    mutationFn: async (collaboratorId: string) => {
      const response = await fetch(`/api/moves/${moveId}/collaborators/${collaboratorId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to remove collaborator')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', moveId] })
      toast.success('Collaborator removed successfully')
    },
    onError: () => {
      toast.error('Failed to remove collaborator')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addCollaborator.mutate()
  }

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?'
  }

  if (isLoading) {
    return (
      <Card className="border-none rounded-3xl soft-shadow">
        <CardHeader>
          <CardTitle>Collaborators</CardTitle>
          <CardDescription>Manage who has access to this move</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none rounded-3xl soft-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <CardTitle>Collaborators</CardTitle>
        </div>
        <CardDescription>Manage who has access to this move</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className="rounded-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full rounded-full"
            disabled={addCollaborator.isPending}
          >
            {addCollaborator.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Collaborator
              </>
            )}
          </Button>
        </form>

        <div className="space-y-4">
          {collaborators?.map((collaborator) => (
            <div
              key={collaborator.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-muted"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {getInitials(collaborator.user.firstName, collaborator.user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {collaborator.user.firstName} {collaborator.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{collaborator.user.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    {collaborator.role}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-destructive hover:text-destructive"
                onClick={() => removeCollaborator.mutate(collaborator.id)}
                disabled={removeCollaborator.isPending}
              >
                {removeCollaborator.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 