"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PageProps {
  params: {
    moveId: string
  }
}

export default function CreateItemListPage({ params }: PageProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const validatedData = formSchema.parse(formData)

      const response = await fetch(`/api/company/moves/${params.moveId}/item-lists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      })

      if (!response.ok) {
        throw new Error("Failed to create item list")
      }

      toast.success("Item list created successfully")
      router.push(`/dashboard/company/moves/${params.moveId}`)
      router.refresh()
    } catch (error) {
      console.error("Error creating item list:", error)
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      } else {
        toast.error("Failed to create item list")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 rounded-full">
          <Link href={`/dashboard/company/moves/${params.moveId}`}>
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
                  minLength={2}
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
              <Button
                variant="outline"
                type="button"
                asChild
                className="rounded-full"
              >
                <Link href={`/dashboard/company/moves/${params.moveId}`}>
                  Cancel
                </Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full"
              >
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