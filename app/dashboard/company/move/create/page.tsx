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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Truck, Users, Calendar } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  clientName: z.string().min(2, { message: "Client name must be at least 2 characters" }),
  clientEmail: z.string().email({ message: "Please enter a valid email address" }),
  clientPhone: z.string().min(10, { message: "Please enter a valid phone number" }),
  fromAddress: z.object({
    street: z.string().min(5, { message: "Please enter a valid street address" }),
    city: z.string().min(2, { message: "Please enter a valid city" }),
    state: z.string().min(2, { message: "Please enter a valid state" }),
    zipCode: z.string().min(5, { message: "Please enter a valid ZIP code" }),
    country: z.string().min(2, { message: "Please enter a valid country" }),
  }),
  toAddress: z.object({
    street: z.string().min(5, { message: "Please enter a valid street address" }),
    city: z.string().min(2, { message: "Please enter a valid city" }),
    state: z.string().min(2, { message: "Please enter a valid state" }),
    zipCode: z.string().min(5, { message: "Please enter a valid ZIP code" }),
    country: z.string().min(2, { message: "Please enter a valid country" }),
  }),
  description: z.string().optional(),
  moveDate: z.date({ required_error: "Please select a move date" }),
  estimatedHours: z.string().min(1, { message: "Please enter estimated hours" }),
  assignedEmployees: z.array(z.string()).min(1, { message: "Please assign at least one employee" }),
  moveType: z.string().min(1, { message: "Please select a move type" }),
})

// Mock data for employees
const mockEmployees = [
  { id: "1", name: "John Doe", role: "Foreman", avatar: "/placeholder.svg?height=32&width=32&text=JD" },
  { id: "2", name: "Sarah Lee", role: "Worker", avatar: "/placeholder.svg?height=32&width=32&text=SL" },
  { id: "3", name: "Mike Smith", role: "Worker", avatar: "/placeholder.svg?height=32&width=32&text=MS" },
  { id: "4", name: "Alex Johnson", role: "Worker", avatar: "/placeholder.svg?height=32&width=32&text=AJ" },
  { id: "5", name: "Lisa Kim", role: "Worker", avatar: "/placeholder.svg?height=32&width=32&text=LK" },
  { id: "6", name: "David Rodriguez", role: "Foreman", avatar: "/placeholder.svg?height=32&width=32&text=DR" },
]

export default function AddMovePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      fromAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA",
      },
      toAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA",
      },
      description: "",
      estimatedHours: "",
      assignedEmployees: [],
      moveType: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Here you would typically make an API call to create the move
      console.log(values)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create a calendar event for this move
      const eventData = {
        title: values.title,
        date: format(values.moveDate, "yyyy-MM-dd"),
        startTime: "09:00", // Default start time
        endTime: "17:00", // Default end time
        type: "move",
        location: `${values.fromAddress.street}, ${values.fromAddress.city}, ${values.fromAddress.state}`,
        description: values.description || `Moving job for ${values.clientName}`,
        attendees: values.assignedEmployees,
      }

      console.log("Creating calendar event:", eventData)

      // Redirect to moves page on successful creation
      router.push("/dashboard/company/moves")
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/company/moves">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Moves
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Add New Move</h1>
        <p className="text-muted-foreground">Create a new moving job and assign team members</p>
      </div>

      <Card className="border-none rounded-3xl soft-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <CardTitle>Move Details</CardTitle>
          </div>
          <CardDescription>Enter the details of the new moving job</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Move Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Johnson Family Move" {...field} className="rounded-full" />
                        </FormControl>
                        <FormDescription>Give the move a descriptive title</FormDescription>
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
                            <SelectItem value="RESIDENTIAL">Residential Move</SelectItem>
                            <SelectItem value="COMMERCIAL">Commercial Move</SelectItem>
                            <SelectItem value="STORAGE">Storage Move</SelectItem>
                            <SelectItem value="PACKING">Packing Only</SelectItem>
                            <SelectItem value="UNPACKING">Unpacking Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Select the type of moving job</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="moveDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Move Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "rounded-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>When is the move scheduled?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimatedHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Hours</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} className="rounded-full" />
                        </FormControl>
                        <FormDescription>Estimated duration of the move in hours</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} className="rounded-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Email address" {...field} className="rounded-full" />
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
                          <FormLabel>Client Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number" {...field} className="rounded-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="fromAddress.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Street address" {...field} className="rounded-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="fromAddress.city"
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
                      name="fromAddress.state"
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

                    <FormField
                      control={form.control}
                      name="fromAddress.zipCode"
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
                  </div>

                  <FormField
                    control={form.control}
                    name="toAddress.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Street address" {...field} className="rounded-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="toAddress.city"
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
                      name="toAddress.state"
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

                    <FormField
                      control={form.control}
                      name="toAddress.zipCode"
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
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional information about the move"
                        className="min-h-[100px] rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Optional: Add any special instructions or notes about the move</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Assign Team Members</h3>
                </div>
                <p className="text-sm text-muted-foreground">Select employees to assign to this move</p>

                <FormField
                  control={form.control}
                  name="assignedEmployees"
                  render={() => (
                    <FormItem>
                      <div className="grid gap-4 md:grid-cols-2">
                        {mockEmployees.map((employee) => (
                          <FormField
                            key={employee.id}
                            control={form.control}
                            name="assignedEmployees"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={employee.id}
                                  className="flex items-center space-x-3 space-y-0 rounded-lg border p-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(employee.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, employee.id])
                                          : field.onChange(field.value?.filter((value) => value !== employee.id))
                                      }}
                                    />
                                  </FormControl>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={employee.avatar} alt={employee.name} />
                                      <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <FormLabel className="font-normal">{employee.name}</FormLabel>
                                      <p className="text-xs text-muted-foreground">{employee.role}</p>
                                    </div>
                                  </div>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" asChild className="rounded-full">
                  <Link href="/dashboard/company/moves">Cancel</Link>
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

