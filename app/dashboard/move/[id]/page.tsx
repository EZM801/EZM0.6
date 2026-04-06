"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Box, Edit, Home, MapPin, Plus, Layout, Clipboard, Package, Calendar, Truck, Map, Users, Clock, Info, AlarmClock, ArrowRight, Pencil, CalendarDays } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"
import { useMove } from "@/app/hooks/useMove"
import { useItemLists } from "@/app/hooks/useItemLists"
import { useTasks } from "@/app/hooks/useTasks"
import { Task } from "@/app/hooks/useTasks"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { MoveStatus } from "@/app/types/MoveType"
import { useRouteParams } from "@/app/hooks/useRouteParams"
import { format } from "date-fns"
import { CollaboratorList } from "@/app/components/move/CollaboratorList"

interface RouteParams {
  id: string
}

export default function MoveDetailsPage() {
  const router = useRouter()
  const params = useRouteParams<RouteParams>()
  const moveId = params.id
  const [activeTab, setActiveTab] = useState("overview")

  const { data: move, isLoading: isLoadingMove, error: moveError } = useMove(moveId)
  const { data: itemLists, isLoading: isLoadingItemLists, error: itemListsError } = useItemLists(moveId)
  const { data: tasks, isLoading: isLoadingTasks, error: tasksError } = useTasks(moveId)

  useEffect(() => {
    if (moveError) {
      console.error('Move error:', moveError)
      toast.error(moveError.message || "Failed to load move details")
      router.push('/dashboard/move')
    }
    if (itemListsError) {
      console.error('Item lists error:', itemListsError)
      toast.error("Failed to load item lists")
    }
    if (tasksError) {
      console.error('Tasks error:', tasksError)
      toast.error("Failed to load tasks")
    }
  }, [moveError, itemListsError, tasksError, router])

  // Format status for display
  const formatStatus = (status: MoveStatus | undefined) => {
    if (!status) return "Unknown Status";
    return status
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (isLoadingMove) {
    return (
      <div className="container py-10">
        <Breadcrumb />
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 rounded-full">
            <Link href="/dashboard/move">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Moves
            </Link>
          </Button>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Card className="mx-auto max-w-2xl border-none rounded-3xl soft-shadow">
          <CardHeader>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (moveError) {
    return (
      <div className="container py-10">
        <Breadcrumb />
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 rounded-full">
            <Link href="/dashboard/move">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Moves
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Error Loading Move</h1>
          <p className="text-muted-foreground">{moveError.message}</p>
        </div>
      </div>
    )
  }

  if (!move) {
    return (
      <div className="container py-10">
        <Breadcrumb />
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 rounded-full">
            <Link href="/dashboard/move">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Moves
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Move Not Found</h1>
          <p className="text-muted-foreground">The move you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Breadcrumb />
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <Button variant="ghost" asChild className="mb-4 rounded-full">
            <Link href="/dashboard/move">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Moves
            </Link>
          </Button>
          <Button variant="outline" asChild className="rounded-full">
            <Link href={`/dashboard/move/${moveId}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Move
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">{move.name}</h1>
        <p className="text-muted-foreground">{move.description}</p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-5 rounded-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="layouts">Layouts</TabsTrigger>
          <TabsTrigger value="supplies">Supplies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 border-none rounded-3xl soft-shadow">
              <CardHeader>
                <CardTitle>Move Details</CardTitle>
                <CardDescription>Overview of your move information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="font-medium">Name</h3>
                    <p className="text-sm text-muted-foreground">{move.name}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Status</h3>
                    <Badge variant={move.status === "in_progress" ? "default" : "outline"} className="rounded-full">
                      {formatStatus(move.status)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Move Date</h3>
                    <p className="text-muted-foreground">
                      {move.startDate ? new Date(move.startDate).toLocaleDateString() : "Not set"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Move Type</h3>
                    <p className="text-muted-foreground capitalize">
                      {move?.moveType ? move.moveType.toLowerCase() : "Not set"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">From Address</h3>
                      <p className="text-muted-foreground">
                        {move.fromAddress ? (
                          <>
                            {move.fromAddress.street}, {move.fromAddress.city}, {move.fromAddress.state}{" "}
                            {move.fromAddress.zipCode}
                          </>
                        ) : (
                          "Not set"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Home className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">To Address</h3>
                      <p className="text-muted-foreground">
                        {move.toAddress ? (
                          <>
                            {move.toAddress.street}, {move.toAddress.city}, {move.toAddress.state}{" "}
                            {move.toAddress.zipCode}
                          </>
                        ) : (
                          "Not set"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {move.description && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="font-medium">Description</h3>
                      <p className="text-muted-foreground">{move.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-none rounded-3xl soft-shadow">
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                  <CardDescription>Information about your properties</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Layouts</h3>
                    <p className="text-muted-foreground">
                      {move.layouts?.length || 0} layouts
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">From Address</h3>
                    <p className="text-muted-foreground">
                      {move.fromAddress ? (
                        <>
                          {move.fromAddress.street}, {move.fromAddress.city}, {move.fromAddress.state} {move.fromAddress.zipCode}
                          {move.fromAddress.floorNumber && <> • Floor {move.fromAddress.floorNumber}</>}
                          {move.fromAddress.hasElevator && <> • Has Elevator</>}
                        </>
                      ) : (
                        "Not specified"
                      )}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">To Address</h3>
                    <p className="text-muted-foreground">
                      {move.toAddress ? (
                        <>
                          {move.toAddress.street}, {move.toAddress.city}, {move.toAddress.state} {move.toAddress.zipCode}
                          {move.toAddress.floorNumber && <> • Floor {move.toAddress.floorNumber}</>}
                          {move.toAddress.hasElevator && <> • Has Elevator</>}
                        </>
                      ) : (
                        "Not specified"
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Move Stops</CardTitle>
                  <CardDescription>Additional stops during your move</CardDescription>
                </CardHeader>
                <CardContent>
                  {move?.stops && move.stops.length > 0 ? (
                    <div className="space-y-4">
                      {move.stops.map((stop) => (
                        <div key={stop.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{stop.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {stop.addressDetails ? (
                                  <>
                                    {stop.addressDetails.street}, {stop.addressDetails.city}, {stop.addressDetails.state} {stop.addressDetails.zipCode}
                                    {stop.addressDetails.floorNumber && <> • Floor {stop.addressDetails.floorNumber}</>}
                                    {stop.addressDetails.hasElevator && <> • Has Elevator</>}
                                  </>
                                ) : (
                                  <>
                                    {stop.address}, {stop.city}, {stop.state} {stop.zipCode}
                                    {stop.country && `, ${stop.country}`}
                                  </>
                                )}
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {stop.arrivalDate && (
                                <p>Arrival: {new Date(stop.arrivalDate).toLocaleDateString()}</p>
                              )}
                              {stop.departureDate && (
                                <p>Departure: {new Date(stop.departureDate).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                          {stop.notes && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground">{stop.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No additional stops added to this move.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none rounded-3xl soft-shadow">
                <CardHeader>
                  <CardTitle>Collaborators</CardTitle>
                  <CardDescription>People helping with your move</CardDescription>
                </CardHeader>
                <CardContent>
                  <CollaboratorList moveId={moveId} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="items">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight gradient-text">Item Lists</h2>
              <Button asChild className="rounded-full">
                <Link href={`/dashboard/move/${moveId}/item-lists/create`}>
                  <Plus className="mr-2 h-4 w-4" /> Add Item List
                </Link>
              </Button>
            </div>

            {!itemLists || itemLists.length === 0 ? (
              <Card className="border-none rounded-3xl soft-shadow">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <div className="rounded-full bg-muted p-3">
                    <Box className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No item lists yet</h3>
                  <p className="mb-4 mt-2 text-center text-sm text-muted-foreground">
                    You haven&apos;t created any item lists for this move yet.
                  </p>
                  <Button asChild className="rounded-full">
                    <Link href={`/dashboard/move/${moveId}/item-lists/create`}>
                      <Plus className="mr-2 h-4 w-4" /> Add Item List
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {itemLists.map((list) => (
                  <Card key={list.id} className="border-none rounded-3xl soft-shadow card-hover">
                    <CardHeader className="pb-3">
                      <CardTitle>{list.name}</CardTitle>
                      <CardDescription>
                        {list.items?.length || 0} items
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {list.description && (
                        <p className="text-sm text-muted-foreground">{list.description}</p>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" asChild className="rounded-full">
                        <Link href={`/dashboard/move/${moveId}/item-lists/${list.id}`}>
                          View Items
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="rounded-full">
                        <Link href={`/dashboard/move/${moveId}/item-lists/${list.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight gradient-text">Tasks</h2>
              <Button asChild className="rounded-full">
                <Link href={`/dashboard/move/${moveId}/tasks/create`}>
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </Link>
              </Button>
            </div>

            {!tasks || tasks.length === 0 ? (
              <Card className="border-none rounded-3xl soft-shadow">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <div className="rounded-full bg-muted p-3">
                    <Clipboard className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No tasks yet</h3>
                  <p className="mb-4 mt-2 text-center text-sm text-muted-foreground">
                    You haven&apos;t created any tasks for this move yet.
                  </p>
                  <Button asChild className="rounded-full">
                    <Link href={`/dashboard/move/${moveId}/tasks/create`}>
                      <Plus className="mr-2 h-4 w-4" /> Add Task
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {['pending', 'in_progress', 'completed'].map((status) => {
                  const statusTasks = tasks.filter((task: Task) => task.status === status)
                  const statusLabel = {
                    pending: 'To Do',
                    in_progress: 'In Progress',
                    completed: 'Completed'
                  }[status]

                  return (
                    <div key={status} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">{statusLabel}</h3>
                        <Badge variant="outline" className="rounded-full">
                          {statusTasks.length}
                        </Badge>
                      </div>
                      <div className="space-y-4">
                        {statusTasks.map((task: Task) => (
                          <Card 
                            key={task.id} 
                            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/dashboard/move/${moveId}/tasks/${task.id}/edit`)}
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
                                      router.push(`/dashboard/move/${moveId}/tasks/${task.id}/edit`)
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
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="layouts">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight gradient-text">Layouts</h2>
              <Button asChild className="rounded-full">
                <Link href={`/dashboard/move/${moveId}/layout/create`}>
                  <Plus className="mr-2 h-4 w-4" /> Add Layout
                </Link>
              </Button>
            </div>

            {(() => {
              console.log('Move layouts:', move.layouts);
              return null;
            })()}

            {!move.layouts || move.layouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <h2 className="text-xl font-semibold text-muted-foreground">No layouts found</h2>
                <p className="text-muted-foreground">Create a layout to get started.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {move.layouts.map((layout) => (
                  <Card key={layout.id} className="border-none rounded-3xl soft-shadow">
                    <CardHeader>
                      <CardTitle>{layout.name}</CardTitle>
                      <CardDescription>
                        {layout.orientation === "origin" ? "Origin Layout" : "Destination Layout"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {layout.instructions && (
                        <p className="text-sm text-muted-foreground">{layout.instructions}</p>
                      )}
                      <div className="mt-4">
                        <Button asChild variant="outline" className="w-full">
                          <Link href={`/dashboard/move/${moveId}/layout/${layout.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="supplies">
          <div className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-gradient-to-r from-gradient-start to-gradient-mid p-4">
              <Package className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Manage Supplies</h3>
            <p className="mb-4 mt-2 text-center text-sm text-muted-foreground">
              Manage supplies for your move
            </p>
            <Button asChild className="rounded-full">
              <Link href={`/dashboard/move/${moveId}/supplies`}>
                <Package className="mr-2 h-4 w-4" /> Manage Supplies
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

