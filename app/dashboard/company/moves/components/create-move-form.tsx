"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MultiSelect } from "@/components/ui/multi-select"
import { useQuery } from "@tanstack/react-query"
import { Plus, Minus, MapPin, Truck, Users, Calendar as CalendarIcon, ClipboardList } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
})

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  moveType: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().email({ message: "Please enter a valid email address" }).optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  estimatedBudget: z.string().optional(),
  estimatedHours: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  fromAddress: addressSchema.optional().default({}),
  stops: z.array(addressSchema).optional().default([]),
  toAddress: addressSchema.optional().default({}),
  specialInstructions: z.string().optional(),
  assignedEmployees: z.array(z.string()).optional(),
  assignedVehicles: z.array(z.string()).optional(),
  assignedEquipment: z.array(z.string()).optional(),
})

type FormValues = z.infer<typeof formSchema>

function AddressFields({ 
  control, 
  prefix, 
  label 
}: { 
  control: any,
  prefix: string, 
  label: string 
}) {
  return (
    <div className="space-y-4 border rounded-lg p-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        {label}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name={`${prefix}.street`}
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel className="text-base">Street Address</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Street address" 
                  {...field} 
                  className="rounded-full text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${prefix}.city`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">City</FormLabel>
              <FormControl>
                <Input 
                  placeholder="City" 
                  {...field} 
                  className="rounded-full text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${prefix}.state`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">State</FormLabel>
              <FormControl>
                <Input 
                  placeholder="State" 
                  {...field} 
                  className="rounded-full text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${prefix}.zipCode`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">ZIP Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="ZIP" 
                  {...field} 
                  className="rounded-full text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

async function fetchEmployees() {
  const response = await fetch("/api/company/employees")
  if (!response.ok) throw new Error("Failed to fetch employees")
  const data = await response.json()
  return data
}

async function fetchVehicles() {
  const response = await fetch("/api/company/vehicles")
  if (!response.ok) throw new Error("Failed to fetch vehicles")
  const data = await response.json()
  return data
}

async function fetchEquipment() {
  const response = await fetch("/api/company/equipment")
  if (!response.ok) throw new Error("Failed to fetch equipment")
  const data = await response.json()
  return data
}

export function CreateMoveForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stops, setStops] = useState<number[]>([])
  const router = useRouter()

  const { data: employeesResponse, isLoading: isLoadingEmployees, error: employeesError } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees
  })

  const { data: vehiclesResponse, isLoading: isLoadingVehicles, error: vehiclesError } = useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchVehicles
  })

  const { data: equipmentResponse, isLoading: isLoadingEquipment, error: equipmentError } = useQuery({
    queryKey: ["equipment"],
    queryFn: fetchEquipment
  })

  const employees = employeesResponse?.data || []
  const vehicles = vehiclesResponse?.data || []
  const equipment = equipmentResponse?.data || []

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      moveType: "",
      startDate: undefined,
      endDate: undefined,
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      estimatedBudget: "",
      estimatedHours: "",
      priority: "MEDIUM",
      fromAddress: {},
      stops: [],
      toAddress: {},
      specialInstructions: "",
      assignedEmployees: [],
      assignedVehicles: [],
      assignedEquipment: [],
    },
  })

  const addStop = () => {
    const newStopIndex = stops.length
    setStops([...stops, newStopIndex])
    const currentStops = form.getValues("stops") || []
    form.setValue("stops", [...currentStops, {}])
  }

  const removeStop = (index: number) => {
    setStops(stops.filter(i => i !== index))
    const currentStops = form.getValues("stops") || []
    form.setValue("stops", currentStops.filter((_, i) => i !== index))
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/company-moves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to create move")
      }

      toast.success("Move created successfully")
      onSuccess?.()
      router.refresh()
    } catch (error) {
      console.error("Error creating move:", error)
      toast.error("Failed to create move")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="client" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Client
              </TabsTrigger>
              <TabsTrigger value="locations" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Locations
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Resources
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Move Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Johnson Family Move" 
                          {...field} 
                          className="rounded-full text-base"
                        />
                      </FormControl>
                      <FormDescription className="text-sm">This is the only required field</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="moveType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Move Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-full text-base">
                              <SelectValue placeholder="Select move type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="RESIDENTIAL">Residential Move</SelectItem>
                            <SelectItem value="COMMERCIAL">Commercial Move</SelectItem>
                            <SelectItem value="STORAGE">Storage Move</SelectItem>
                            <SelectItem value="PACKING">Packing Only</SelectItem>
                            <SelectItem value="UNPACKING">Unpacking Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-full text-base">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "rounded-full w-full pl-3 text-left font-normal text-base",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimatedHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Estimated Hours</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 4" 
                            {...field} 
                            className="rounded-full text-base" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add a description of the move"
                          className="min-h-[100px] rounded-xl resize-none text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="client" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} className="rounded-full text-base" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Client Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email address" {...field} className="rounded-full text-base" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Client Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} className="rounded-full text-base" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Estimated Budget</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 1000" 
                          {...field} 
                          className="rounded-full text-base" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="locations" className="space-y-6">
              <AddressFields 
                control={form.control} 
                prefix="fromAddress" 
                label="Origin Address" 
              />
              
              {stops.map((stopIndex) => (
                <div key={stopIndex} className="relative">
                  <AddressFields 
                    control={form.control}
                    prefix={`stops.${stopIndex}`} 
                    label={`Stop ${stopIndex + 1}`} 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeStop(stopIndex)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={addStop}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stop
                </Button>
              </div>

              <AddressFields 
                control={form.control}
                prefix="toAddress" 
                label="Destination Address" 
              />
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <FormField
                control={form.control}
                name="assignedEmployees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Assigned Employees</FormLabel>
                    <FormControl>
                      {isLoadingEmployees ? (
                        <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
                      ) : employeesError ? (
                        <div className="text-destructive text-sm">Failed to load employees</div>
                      ) : (
                        <MultiSelect
                          placeholder="Select employees"
                          options={employees.map((employee: any) => ({
                            label: `${employee.firstName} ${employee.lastName}`,
                            value: employee.id
                          }))}
                          value={field.value || []}
                          onChange={field.onChange}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedVehicles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Assigned Vehicles</FormLabel>
                    <FormControl>
                      {isLoadingVehicles ? (
                        <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
                      ) : vehiclesError ? (
                        <div className="text-destructive text-sm">Failed to load vehicles</div>
                      ) : (
                        <MultiSelect
                          placeholder="Select vehicles"
                          options={vehicles.map((vehicle: any) => ({
                            label: vehicle.name,
                            value: vehicle.id
                          }))}
                          value={field.value || []}
                          onChange={field.onChange}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedEquipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Assigned Equipment</FormLabel>
                    <FormControl>
                      {isLoadingEquipment ? (
                        <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
                      ) : equipmentError ? (
                        <div className="text-destructive text-sm">Failed to load equipment</div>
                      ) : (
                        <MultiSelect
                          placeholder="Select equipment"
                          options={equipment.map((item: any) => ({
                            label: item.name,
                            value: item.id
                          }))}
                          value={field.value || []}
                          onChange={field.onChange}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Special Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any special instructions or requirements"
                        className="min-h-[100px] rounded-xl resize-none text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-8">
            <Button 
              variant="outline" 
              onClick={() => onSuccess?.()} 
              type="button"
              className="rounded-full text-base px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="rounded-full text-base px-6"
            >
              {isSubmitting ? "Creating..." : "Create Move"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
} 