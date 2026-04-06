"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
})

export default function EditTaskPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const moveId = params.id as string
  const taskId = params.taskId as string

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      priority: "normal",
    },
  })

  useEffect(() => {
    async function fetchTask() {
      try {
        const response = await fetch(`/api/moves/my/${moveId}/tasks/${taskId}`)
        if (!response.ok) throw new Error("Failed to fetch task")
        
        const data = await response.json()
        const task = data.task

        form.reset({
          title: task.title,
          description: task.description || "",
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        })
      } catch (error) {
        console.error("Error fetching task:", error)
        toast.error("Failed to load task")
        router.push(`/dashboard/move/${moveId}?tab=tasks`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTask()
  }, [taskId, moveId, form, router])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/moves/my/${moveId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          status: values.status,
          priority: values.priority,
          dueDate: values.dueDate?.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      await queryClient.invalidateQueries({ queryKey: ['tasks', moveId] })
      
      toast.success("Task updated successfully")
      router.push(`/dashboard/move/${moveId}?tab=tasks`)
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update task")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div>Loading task...</div>
  }

  return (
    <div className="container py-10">
      <Breadcrumb />
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 rounded-full">
          <Link href={`/dashboard/move/${moveId}?tab=tasks`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tasks
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Edit Task</h1>
        <p className="text-muted-foreground">Update the details of your task</p>
      </div>

      <Card className="border-none rounded-3xl soft-shadow">
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>Modify the task information below</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Pack kitchen items" {...field} className="rounded-lg" />
                    </FormControl>
                    <FormDescription>Enter a clear and concise title for the task.</FormDescription>
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
                      <Textarea
                        placeholder="Wrap dishes in bubble wrap and pack in small boxes"
                        {...field}
                        className="rounded-lg"
                      />
                    </FormControl>
                    <FormDescription>Provide any additional details about the task.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal rounded-lg",
                                !field.value && "text-muted-foreground"
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>When should this task be completed by?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Set the priority level for this task.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Set the current status of the task.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => router.push(`/dashboard/move/${moveId}?tab=tasks`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  className="rounded-full" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 