"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Truck, Plus, Trash2, MapPin } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { AddressInput } from "@/components/address-input"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  moveType: z.enum(["residential", "commercial", "storage", "packing", "unpacking"]),
  startDate: z.date(),
  endDate: z.date().optional(),
  fromAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1).default("US"),
  }).optional(),
  toAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1).default("US"),
  }).optional(),
  stops: z.array(z.object({
    name: z.string().optional(),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1).default("US"),
    notes: z.string().optional(),
  })).optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateMovePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFromAddress, setShowFromAddress] = useState(false)
  const [showToAddress, setShowToAddress] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      moveType: "residential",
      startDate: new Date(),
      endDate: undefined,
      fromAddress: undefined,
      toAddress: undefined,
      stops: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stops",
  })

  const handleAddressVisibility = (type: 'from' | 'to', show: boolean) => {
    if (type === 'from') {
      setShowFromAddress(show);
      if (!show) {
        form.setValue('fromAddress', undefined);
      } else {
        form.setValue('fromAddress', {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "US",
        });
      }
    } else {
      setShowToAddress(show);
      if (!show) {
        form.setValue('toAddress', undefined);
      } else {
        form.setValue('toAddress', {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "US",
        });
      }
    }
  };

  const handleAddStop = () => {
    append({
      name: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
      notes: "",
    });
  };

  const handleRemoveStop = (index: number) => {
    remove(index);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

    try {
      // Clean and validate the data before submission
      const submitData = {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        moveType: values.moveType || "residential",
        startDate: values.startDate?.toISOString() || new Date().toISOString(),
        endDate: values.endDate?.toISOString() || undefined,
        fromAddress: values.fromAddress ? {
          street: values.fromAddress.street.trim(),
          city: values.fromAddress.city.trim(),
          state: values.fromAddress.state.trim(),
          zipCode: values.fromAddress.zipCode.trim(),
          country: values.fromAddress.country.trim(),
        } : undefined,
        toAddress: values.toAddress ? {
          street: values.toAddress.street.trim(),
          city: values.toAddress.city.trim(),
          state: values.toAddress.state.trim(),
          zipCode: values.toAddress.zipCode.trim(),
          country: values.toAddress.country.trim(),
        } : undefined,
        stops: values.stops?.map(stop => ({
          name: stop.name?.trim() || undefined,
          street: stop.street.trim(),
          city: stop.city.trim(),
          state: stop.state.trim(),
          zipCode: stop.zipCode.trim(),
          country: stop.country.trim(),
          notes: stop.notes?.trim() || undefined,
        })) || [],
      }

      const response = await fetch("/api/moves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to create move")
      }

      // Show success message
      toast({
        title: "Success",
        description: "Move created successfully",
      })

      // Redirect to the move details page
      router.push(`/dashboard/move/${data.data.id}`)
    } catch (error) {
      console.error("Error creating move:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create move",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 rounded-full">
          <Link href="/dashboard/move">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Moves
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Add New Move</h1>
        <p className="text-muted-foreground">Create a new move to start organizing your relocation</p>
      </div>

      <Card className="mx-auto max-w-2xl border-none rounded-3xl soft-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <CardTitle>Move Details</CardTitle>
          </div>
          <CardDescription>Enter the details of your upcoming move</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Move Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Moving to Seattle" {...field} className="rounded-full" />
                    </FormControl>
                    <FormDescription>Give your move a descriptive name to easily identify it</FormDescription>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-full">
                          <SelectValue placeholder="Select move type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="residential">Residential Move</SelectItem>
                        <SelectItem value="commercial">Commercial Move</SelectItem>
                        <SelectItem value="storage">Storage Move</SelectItem>
                        <SelectItem value="packing">Packing Only</SelectItem>
                        <SelectItem value="unpacking">Unpacking Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>What type of move are you planning?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Move Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal rounded-full",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>When is your move scheduled?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">From Address</h3>
                    <p className="text-sm text-muted-foreground">Where are you moving from?</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={showFromAddress}
                      onCheckedChange={(value) => handleAddressVisibility('from', value)}
                      id="show-from-address"
                    />
                    <label htmlFor="show-from-address" className="text-sm text-muted-foreground">
                      Provide address
                    </label>
                  </div>
                </div>

                {showFromAddress && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fromAddress.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

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
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">To Address</h3>
                    <p className="text-sm text-muted-foreground">Where are you moving to?</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={showToAddress}
                      onCheckedChange={(value) => handleAddressVisibility('to', value)}
                      id="show-to-address"
                    />
                    <label htmlFor="show-to-address" className="text-sm text-muted-foreground">
                      Provide address
                    </label>
                  </div>
                </div>

                {showToAddress && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="toAddress.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

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
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Stops</h3>
                    <p className="text-sm text-muted-foreground">Add any intermediate stops</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={handleAddStop}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Stop
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Stop {index + 1}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStop(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`stops.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stop Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Stop Name" {...field} className="rounded-full" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`stops.${index}.street`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} className="rounded-full" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`stops.${index}.city`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="City" {...field} className="rounded-full" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`stops.${index}.state`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="State" {...field} className="rounded-full" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`stops.${index}.zipCode`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="ZIP" {...field} className="rounded-full" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`stops.${index}.notes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add any notes about this stop"
                                className="min-h-[100px] rounded-xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional information about your move"
                        className="min-h-[100px] rounded-xl"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>Optional: Add any special instructions or notes about your move</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" asChild className="rounded-full">
                  <Link href="/dashboard/move">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-full">
                  {isSubmitting ? "Creating Move..." : "Create Move"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

