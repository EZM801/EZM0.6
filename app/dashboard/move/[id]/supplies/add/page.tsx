"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"
import { toast } from "sonner"

// Mock data for demonstration
const availableSupplies = [
  { id: "1", name: "Small Moving Boxes", price: 2.99 },
  { id: "2", name: "Medium Moving Boxes", price: 3.99 },
  { id: "3", name: "Large Moving Boxes", price: 4.99 },
  { id: "4", name: "Bubble Wrap (50ft)", price: 12.99 },
  { id: "5", name: "Packing Tape", price: 3.49 },
  { id: "6", name: "Packing Paper (25 sheets)", price: 5.99 },
  { id: "7", name: "Furniture Blankets", price: 9.99 },
  { id: "8", name: "Mattress Bag (Queen/King)", price: 7.99 },
  { id: "9", name: "Plastic Wrap", price: 4.99 },
]

const formSchema = z.object({
  supplyId: z.string({
    required_error: "Please select a supply.",
  }),
  quantity: z.coerce.number().min(1, {
    message: "Quantity must be at least 1.",
  }),
})

export default function AddSuppliesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [selectedSupplies, setSelectedSupplies] = useState<
    Array<{ id: string; name: string; quantity: number; price: number }>
  >([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const selectedSupply = availableSupplies.find((supply) => supply.id === values.supplyId)
    if (selectedSupply) {
      setSelectedSupplies([
        ...selectedSupplies,
        {
          id: selectedSupply.id,
          name: selectedSupply.name,
          quantity: values.quantity,
          price: selectedSupply.price,
        },
      ])
      form.reset({
        supplyId: "",
        quantity: 1,
      })
    }
  }

  const handleRemoveSupply = (id: string) => {
    setSelectedSupplies(selectedSupplies.filter((supply) => supply.id !== id))
  }

  const handleSaveAll = async () => {
    try {
      for (const supply of selectedSupplies) {
        const response = await fetch(`/api/moves/my/${params.id}/supplies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            supplyId: supply.id,
            quantity: supply.quantity,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Failed to allocate supply")
        }
      }

      toast.success("Supplies allocated successfully")
      router.push(`/dashboard/move/${params.id}?tab=supplies`)
    } catch (error) {
      console.error("Error allocating supplies:", error)
      toast.error(error instanceof Error ? error.message : "Failed to allocate supplies")
    }
  }

  const calculateTotal = () => {
    return selectedSupplies.reduce((total, supply) => total + supply.price * supply.quantity, 0)
  }

  return (
    <div className="container py-10">
      <Breadcrumb />
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 rounded-full">
          <Link href={`/dashboard/move/${params.id}?tab=supplies`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Supplies
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Add Supplies</h1>
        <p className="text-muted-foreground">Order supplies for your move</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none rounded-3xl soft-shadow">
          <CardHeader>
            <CardTitle>Select Supplies</CardTitle>
            <CardDescription>Choose from our available moving supplies</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="supplyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supply Item</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select a supply item" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableSupplies.map((supply) => (
                            <SelectItem key={supply.id} value={supply.id}>
                              {supply.name} - ${supply.price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Choose from our selection of moving supplies</FormDescription>
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
                        <Input type="number" min={1} {...field} className="rounded-lg" />
                      </FormControl>
                      <FormDescription>How many of this item do you need?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="rounded-full">
                  <Plus className="mr-2 h-4 w-4" /> Add to Order
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-none rounded-3xl soft-shadow">
          <CardHeader>
            <CardTitle>Your Order</CardTitle>
            <CardDescription>Review your selected supplies</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSupplies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No supplies added yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Select supplies from the left panel to add them to your order
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedSupplies.map((supply) => (
                  <div key={supply.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{supply.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {supply.quantity} × ${supply.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">${(supply.quantity * supply.price).toFixed(2)}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSupply(supply.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t mt-4">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Total</p>
                    <p className="font-bold">${calculateTotal().toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => router.push(`/dashboard/move/${params.id}?tab=supplies`)}
        >
          Cancel
        </Button>
        <Button className="rounded-full" onClick={handleSaveAll} disabled={selectedSupplies.length === 0}>
          Place Order
        </Button>
      </div>
    </div>
  )
}

