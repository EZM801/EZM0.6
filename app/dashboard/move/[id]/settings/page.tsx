import { Metadata } from 'next'
import { CollaboratorManagement } from '@/app/components/move/CollaboratorManagement'
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
import { Label } from '@/components/ui/label'

export const metadata: Metadata = {
  title: 'Move Settings',
  description: 'Manage your move settings and collaborators',
}

interface MoveSettingsPageProps {
  params: {
    id: string
  }
}

export default function MoveSettingsPage({ params }: MoveSettingsPageProps) {
  return (
    <div className="container py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Move Settings</h1>
        <p className="text-muted-foreground">
          Manage your move settings, visibility, and collaborators
        </p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Visibility Settings</CardTitle>
            <CardDescription>Control who can see your move</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-[200px]">
              <Label htmlFor="visibility">Move Visibility</Label>
              <Select defaultValue="private">
                <SelectTrigger id="visibility">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                Private moves are only visible to you and your collaborators.
                Public moves can be viewed by anyone with the link.
              </p>
            </div>
          </CardContent>
        </Card>

        <CollaboratorManagement moveId={params.id} />
      </div>
    </div>
  )
} 