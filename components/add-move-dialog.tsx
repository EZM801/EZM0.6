"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { toast } from "sonner"

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  hasElevator: z.boolean().optional(),
  floorNumber: z.number().nullable().optional(),
  specialInstructions: z.string().nullable().optional(),
})

const stopSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
  arrivalDate: z.string().nullable().optional(),
  departureDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  moveType: z.enum(['residential', 'commercial', 'storage', 'packing', 'unpacking']),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  fromAddress: addressSchema.nullable().optional(),
  toAddress: addressSchema.nullable().optional(),
  stops: z.array(stopSchema).default([]),
})

type FormValues = z.infer<typeof formSchema>

export function AddMoveDialog() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [stops, setStops] = useState<z.infer<typeof stopSchema>[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      moveType: "residential",
      startDate: new Date().toISOString(),
      stops: [],
    },
  })

  async function onSubmit(data: FormValues) {
    try {
      const response = await fetch("/api/company/moves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          stops,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create move")
      }

      toast.success("Move created successfully")
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Failed to create move")
      console.error(error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Move
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Move</DialogTitle>
          <DialogDescription>
            Create a new move with optional addresses and stops.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Move Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter move name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter move description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="moveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Move Type</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="storage">Storage</option>
                      <option value="packing">Packing</option>
                      <option value="unpacking">Unpacking</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
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
                      <Input 
                        type="datetime-local" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">From Address (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fromAddress.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fromAddress.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fromAddress.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter state" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fromAddress.zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter ZIP code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">To Address (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="toAddress.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="toAddress.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="toAddress.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter state" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="toAddress.zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter ZIP code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Stops (Optional)</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStops([
                      ...stops,
                      {
                        name: "",
                        address: "",
                        city: "",
                        state: "",
                        zipCode: "",
                        country: "US",
                      },
                    ])
                  }}
                >
                  Add Stop
                </Button>
              </div>

              {stops.map((stop, index) => (
                <div key={index} className="space-y-4 border p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Stop {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStops(stops.filter((_, i) => i !== index))
                      }}
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          value={stop.name}
                          onChange={(e) => {
                            const newStops = [...stops]
                            newStops[index] = { ...newStops[index], name: e.target.value }
                            setStops(newStops)
                          }}
                          placeholder="Enter stop name"
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          value={stop.address}
                          onChange={(e) => {
                            const newStops = [...stops]
                            newStops[index] = { ...newStops[index], address: e.target.value }
                            setStops(newStops)
                          }}
                          placeholder="Enter address"
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          value={stop.city}
                          onChange={(e) => {
                            const newStops = [...stops]
                            newStops[index] = { ...newStops[index], city: e.target.value }
                            setStops(newStops)
                          }}
                          placeholder="Enter city"
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          value={stop.state}
                          onChange={(e) => {
                            const newStops = [...stops]
                            newStops[index] = { ...newStops[index], state: e.target.value }
                            setStops(newStops)
                          }}
                          placeholder="Enter state"
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input
                          value={stop.zipCode}
                          onChange={(e) => {
                            const newStops = [...stops]
                            newStops[index] = { ...newStops[index], zipCode: e.target.value }
                            setStops(newStops)
                          }}
                          placeholder="Enter ZIP code"
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input
                          value={stop.country}
                          onChange={(e) => {
                            const newStops = [...stops]
                            newStops[index] = { ...newStops[index], country: e.target.value }
                            setStops(newStops)
                          }}
                          placeholder="Enter country"
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="submit">Create Move</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 