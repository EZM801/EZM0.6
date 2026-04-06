"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  instructions: z.string().optional(),
  orientation: z.enum(['ORIGIN', 'DESTINATION']).default('ORIGIN'),
});

type FormData = z.infer<typeof formSchema>;

interface PageProps {
  params: {
    moveId: string
  }
}

export default function CreateLayoutPage({ params }: PageProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    instructions: "",
    orientation: "ORIGIN",
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

      const response = await fetch(`/api/company-moves/${params.moveId}/layouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      })

      if (!response.ok) {
        throw new Error("Failed to create layout")
      }

      toast.success("Layout created successfully")
      router.push(`/dashboard/company/moves/${params.moveId}`)
      router.refresh()
    } catch (error) {
      console.error("Error creating layout:", error)
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      } else {
        toast.error("Failed to create layout")
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
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Add Layout</h1>
        <p className="text-muted-foreground">Create a new layout for your move</p>
      </div>

      <Card className="mx-auto max-w-2xl border-none rounded-3xl soft-shadow">
        <CardHeader>
          <CardTitle>Layout Details</CardTitle>
          <CardDescription>Enter the details of your new layout</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Layout Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Current Home, New Apartment, etc."
                  className="rounded-full"
                  required
                  minLength={2}
                  maxLength={255}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="orientation">Layout Type</Label>
                <Select
                  value={formData.orientation}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, orientation: value as FormData['orientation'] }))
                  }
                >
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Select layout type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ORIGIN">Origin Location</SelectItem>
                    <SelectItem value="DESTINATION">Destination Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="instructions">Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Add any special instructions or notes about this layout"
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
                {isSubmitting ? "Creating..." : "Create Layout"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 