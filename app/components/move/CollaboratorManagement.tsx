"use client"

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
import { Trash2 } from 'lucide-react'

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

interface CollaboratorManagementProps {
  moveId: string
}

export function CollaboratorManagement({ moveId }: CollaboratorManagementProps) {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('viewer')

  const { data: collaborators, isLoading } = useQuery({
    queryKey: ['move-collaborators', moveId],
    queryFn: async () => {
      const response = await fetch(`/api/moves/${moveId}/collaborators`)
      if (!response.ok) throw new Error('Failed to fetch collaborators')
      return response.json()
    }
  })

  const addCollaboratorMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const response = await fetch(`/api/moves/${moveId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to add collaborator')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['move-collaborators', moveId] })
      setEmail('')
      setRole('viewer')
      toast.success('Collaborator added successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const removeCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorId: string) => {
      const response = await fetch(`/api/moves/${moveId}/collaborators/${collaboratorId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to remove collaborator')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['move-collaborators', moveId] })
      toast.success('Collaborator removed successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }
    addCollaboratorMutation.mutate({ email: email.trim(), role })
  }

  const handleRemoveCollaborator = (collaboratorId: string) => {
    if (!confirm('Are you sure you want to remove this collaborator?')) return
    removeCollaboratorMutation.mutate(collaboratorId)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Collaborators</CardTitle>
        <CardDescription>Add or remove people who can access this move</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddCollaborator} className="space-y-4">
          <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
                required
              />
            </div>
          <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          <Button type="submit" disabled={addCollaboratorMutation.isPending}>
            Add Collaborator
              </Button>
        </form>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <p>Loading...</p>
          ) : collaborators?.length === 0 ? (
            <p className="text-muted-foreground">No collaborators added yet.</p>
          ) : (
            collaborators?.map((collaborator: any) => (
                <div
                  key={collaborator.id}
                className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                  <p className="font-medium">{collaborator.email}</p>
                    <p className="text-sm text-muted-foreground">
                    Role: {collaborator.role}
                    </p>
                  </div>
                    <Button
                      variant="ghost"
                      size="icon"
                  onClick={() => handleRemoveCollaborator(collaborator.id)}
                  disabled={removeCollaboratorMutation.isPending}
                    >
                  <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
} 