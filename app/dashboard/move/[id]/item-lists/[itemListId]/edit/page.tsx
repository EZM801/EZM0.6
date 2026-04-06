"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { useRouteParams } from "@/app/hooks/useRouteParams"
import { useItemList } from "@/app/hooks/useItemList"
import { Skeleton } from "@/components/ui/skeleton"

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
})

type FormData = {
  name: string
  description: string
}

interface RouteParams {
  id: string
  itemListId: string
}

export default function EditItemListPage() {
  const router = useRouter()
  const params = useRouteParams<RouteParams>()
  const moveId = params.id
  const itemListId = params.itemListId

  const { data: itemList, isLoading, error } = useItemList(moveId, itemListId)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
  })

  // Load item list data when available
  useEffect(() => {
    if (itemList) {
      setFormData({
        name: itemList.name || '',
        description: itemList.description || '',
      })
    }
  }, [itemList])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form data
      const validatedData = formSchema.parse(formData)

      const response = await fetch(`/api/moves/${moveId}/item-lists/${itemListId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to update item list')
      }

      toast.success("Item list updated successfully")
      router.push(`/dashboard/move/${moveId}/item-lists/${itemListId}`)
    } catch (error) {
      console.error(error)
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to update item list')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 rounded-full">
            <Link href={`/dashboard/move/${moveId}/item-lists/${itemListId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Item List
            </Link>
          </Button>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Card className="mx-auto max-w-2xl border-none rounded-3xl soft-shadow">
          <CardHeader>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 rounded-full">
            <Link href={`/dashboard/move/${moveId}/item-lists/${itemListId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Item List
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Error</h1>
          <p className="text-destructive">Failed to load item list. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 rounded-full">
          <Link href={`/dashboard/move/${moveId}/item-lists/${itemListId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Item List
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Edit Item List</h1>
        <p className="text-muted-foreground">Update your item list details</p>
      </div>

      <Card className="mx-auto max-w-2xl border-none rounded-3xl soft-shadow">
        <CardHeader>
          <CardTitle>Item List Details</CardTitle>
          <CardDescription>Update the details of your item list</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">List Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Living Room, Kitchen, etc."
                  className="rounded-full"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  placeholder="Add a description for this list"
                  className="rounded-2xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" asChild className="rounded-full">
                <Link href={`/dashboard/move/${moveId}/item-lists/${itemListId}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 