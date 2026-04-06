"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, Plus, Pencil, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import React from "react"

interface Task {
  id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'normal' | 'high'
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

type TaskPriority = 'low' | 'normal' | 'high'
type TaskStatus = 'pending' | 'in_progress' | 'completed'

const priorityOrder: Record<TaskPriority, number> = {
  high: 0,
  normal: 1,
  low: 2
}

const statusLabels: Record<TaskStatus, string> = {
  pending: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed'
}

const statusOrder: TaskStatus[] = ['pending', 'in_progress', 'completed']

function TaskSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-[200px]" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-[80px]" />
            <Skeleton className="h-6 w-[80px]" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function TasksPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const moveId = params.id as string
  const tab = searchParams.get("tab")

  const { data: tasks, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['tasks', moveId],
    queryFn: async () => {
      const response = await fetch(`/api/moves/my/${moveId}/tasks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch tasks')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch tasks')
      }
      
      console.log('Fetched tasks:', data.tasks) // Debug log
      return data.tasks || []
    },
    retry: 1,
    staleTime: 30000,
    enabled: !!moveId && (!tab || tab === 'tasks'),
    refetchOnMount: true
  })

  // Sort tasks by priority and due date
  const sortedTasks = React.useMemo(() => {
    if (!tasks) return []
    console.log('Sorting tasks:', tasks) // Debug log
    return [...tasks].sort((a: Task, b: Task) => {
      // First sort by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff

      // Then sort by due date (tasks without due date go last)
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
  }, [tasks])

  // Group tasks by status
  const groupedTasks = React.useMemo(() => {
    if (!sortedTasks) return {}
    console.log('Grouping tasks:', sortedTasks) // Debug log
    return sortedTasks.reduce((acc: Record<TaskStatus, Task[]>, task: Task) => {
      const status = task.status
      if (!acc[status]) {
        acc[status] = []
      }
      acc[status].push(task)
      return acc
    }, {} as Record<TaskStatus, Task[]>)
  }, [sortedTasks])

  const handleRetry = () => {
    toast.promise(refetch(), {
      loading: 'Retrying...',
      success: 'Successfully refreshed tasks',
      error: 'Failed to refresh tasks'
    })
  }

  const handleCreateTask = () => {
    router.push(`/dashboard/move/${moveId}/tasks/create`)
  }

  const handleEditTask = (taskId: string) => {
    router.push(`/dashboard/move/${moveId}/tasks/${taskId}/edit`)
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load tasks. Please try again.'}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={handleRetry}
          variant="outline"
          className="rounded-full"
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
        <Button 
          onClick={handleCreateTask}
          className="rounded-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <>
            <TaskSkeleton />
            <TaskSkeleton />
            <TaskSkeleton />
          </>
        ) : !tasks || tasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-4">No tasks created yet</p>
              <Button 
                onClick={handleCreateTask}
                className="rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create your first task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {statusOrder.map((status) => (
              <div key={status} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{statusLabels[status]}</h3>
                  <Badge variant="outline" className="rounded-full">
                    {groupedTasks?.[status]?.length || 0}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {groupedTasks?.[status]?.map((task: Task) => (
                    <Card 
                      key={task.id} 
                      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleEditTask(task.id)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              task.priority === 'high' ? 'destructive' : 
                              task.priority === 'normal' ? 'default' : 
                              'secondary'
                            }>
                              {task.priority}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditTask(task.id)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {task.description && (
                          <p className="text-muted-foreground mb-4">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <CalendarDays className="h-4 w-4" />
                              <span>Due: {format(new Date(task.dueDate), 'PPP')}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Created: {format(new Date(task.createdAt), 'PPP')}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 