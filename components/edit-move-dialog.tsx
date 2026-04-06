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
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { MultiSelect } from "@/components/ui/multi-select"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  moveType: z.enum(["residential", "commercial", "storage", "packing", "unpacking"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable().optional(),
  fromAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    hasElevator: z.boolean().optional(),
    floorNumber: z.number().nullable().optional(),
    specialInstructions: z.string().nullable().optional(),
  }).nullable().optional(),
  toAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    hasElevator: z.boolean().optional(),
    floorNumber: z.number().nullable().optional(),
    specialInstructions: z.string().nullable().optional(),
  }).nullable().optional(),
  stops: z.array(z.object({
    name: z.string().optional(),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().optional().default("US"),
    arrivalDate: z.string().nullable().optional(),
    departureDate: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })).optional(),
  assignedEmployees: z.array(z.string()).optional(),
  assignedVehicles: z.array(z.string()).optional(),
  assignedEquipment: z.array(z.string()).optional(),
  assignedSupplies: z.array(z.object({
    supplyId: z.string(),
    quantity: z.number().min(1)
  })).optional(),
})

interface Move {
  id: string
  name: string
  description: string | null
  status: string
  moveType: string
  startDate: Date
  endDate: Date | null
  createdAt: Date
  collaborators: {
    user: {
      id: string
      firstName: string | null
      lastName: string | null
    }
    role: string
  }[]
  equipment: {
    equipment: {
      id: string
      name: string
    }
  }[]
  vehicles: {
    vehicle: {
      id: string
      name: string
    }
  }[]
  supplies: {
    supply: {
      id: string
      name: string
    }
    quantity: number
  }[]
  fromAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    hasElevator?: boolean
    floorNumber?: number | null
    specialInstructions?: string | null
  } | null
  toAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    hasElevator?: boolean
    floorNumber?: number | null
    specialInstructions?: string | null
  } | null
  stops?: Array<{
    name?: string
    street: string
    city: string
    state: string
    zipCode: string
    country?: string
    arrivalDate?: Date | null
    departureDate?: Date | null
    notes?: string | null
  }>
}

interface EditMoveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  move: Move
}

export function EditMoveDialog({ open, onOpenChange, move }: EditMoveDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: move.name,
      description: move.description || "",
      moveType: move.moveType as "residential" | "commercial" | "storage" | "packing" | "unpacking",
      startDate: move.startDate.toISOString(),
      endDate: move.endDate?.toISOString() || null,
      fromAddress: move.fromAddress || null,
      toAddress: move.toAddress || null,
      stops: move.stops?.map(stop => ({
        ...stop,
        arrivalDate: stop.arrivalDate?.toISOString() || null,
        departureDate: stop.departureDate?.toISOString() || null,
      })) || [],
      assignedEmployees: move.collaborators.map((c) => c.user.id),
      assignedVehicles: move.vehicles.map((v) => v.vehicle.id),
      assignedEquipment: move.equipment.map((e) => e.equipment.id),
      assignedSupplies: move.supplies.map((s) => ({
        supplyId: s.supply.id,
        quantity: s.quantity
      })),
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/company/moves/${move.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to update move")
      }

      toast.success("Move updated successfully")
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast.error("Failed to update move")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Move</DialogTitle>
          <DialogDescription>
            Update the details of this move.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Move name" {...field} />
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
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select move type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="storage">Storage</SelectItem>
                        <SelectItem value="packing">Packing</SelectItem>
                        <SelectItem value="unpacking">Unpacking</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Move description"
                      className="resize-none"
                      {...field}
                    />
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(field.value)}
                          onSelect={(date) => field.onChange(date?.toISOString())}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString() || null)}
                          disabled={(date) =>
                            date < new Date(form.getValues("startDate"))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="assignedEmployees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Employees</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={move.collaborators.map((c) => ({
                          value: c.user.id,
                          label: `${c.user.firstName} ${c.user.lastName}`,
                        }))}
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Select employees"
                      />
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
                    <FormLabel>Assign Vehicles</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={move.vehicles.map((v) => ({
                          value: v.vehicle.id,
                          label: v.vehicle.name,
                        }))}
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Select vehicles"
                      />
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
                    <FormLabel>Assign Equipment</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={move.equipment.map((e) => ({
                          value: e.equipment.id,
                          label: e.equipment.name,
                        }))}
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Select equipment"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedSupplies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Supplies</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={move.supplies.map((s) => ({
                          value: s.supply.id,
                          label: `${s.supply.name} (${s.quantity} available)`,
                        }))}
                        value={(field.value || []).map(item => item.supplyId)}
                        onChange={(values) => field.onChange(values.map(supplyId => ({
                          supplyId,
                          quantity: 1
                        })))}
                        placeholder="Select supplies"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Move"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 