"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Equipment } from "@prisma/client"

const formSchema = z.object({
  equipmentId: z.string().uuid("Please select equipment"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

interface AddEquipmentFormProps {
  moveId: string
  availableEquipment: Pick<Equipment, "id" | "name" | "type" | "description">[]
}

export function AddEquipmentForm({ moveId, availableEquipment }: AddEquipmentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipmentId: "",
      quantity: 1,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/company/moves/${moveId}/equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to add equipment")
      }

      toast.success("Equipment added successfully")
      router.push(`/dashboard/company/moves/${moveId}/equipment`)
      router.refresh()
    } catch (error) {
      console.error("Error adding equipment:", error)
      toast.error("Failed to add equipment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="equipmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipment</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableEquipment.map((equipment) => (
                    <SelectItem key={equipment.id} value={equipment.id}>
                      {equipment.name} ({equipment.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date (Optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Equipment"}
        </Button>
      </form>
    </Form>
  )
} 