"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { Prisma } from "@prisma/client"
import { z } from "zod"

const createMoveSchema = z.object({
  fromAddress: z.object({
    street: z.string().min(5),  // Too strict validation
    city: z.string().min(2),    // Too strict validation
    state: z.string().min(2),   // Too strict validation
    zipCode: z.string().min(5), // Too strict validation
  }).nullable().optional(),
  // ...
})

export default function CreateItemListPage() {
  const router = useRouter()
  const params = useParams()
  const moveId = params?.id as string
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    // Only update if the value has actually changed
    if (formData[name as keyof typeof formData] !== value) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/moves/my/${moveId}/item-lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to create item list')
      }

      toast.success('Item list created successfully')
      router.push(`/dashboard/move/${moveId}`)
    } catch (error) {
      console.error('Error creating item list:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create item list')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 rounded-full">
          <Link href={`/dashboard/move/${moveId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Move
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Add Item List</h1>
        <p className="text-muted-foreground">Create a new list to organize your items</p>
      </div>

      <Card className="mx-auto max-w-2xl border-none rounded-3xl soft-shadow">
        <CardHeader>
          <CardTitle>Item List Details</CardTitle>
          <CardDescription>Enter the details of your new item list</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">List Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Living Room Items, Kitchen Supplies, etc."
                  className="rounded-full"
                  required
                  minLength={1}
                  maxLength={255}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Any special instructions or notes about this list"
                  className="min-h-[100px] rounded-2xl"
                  maxLength={1000}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" asChild className="rounded-full">
                <Link href={`/dashboard/move/${moveId}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-full">
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Creating..." : "Create Item List"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

