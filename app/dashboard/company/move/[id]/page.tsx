"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Box, Edit, Home, MapPin, Plus, Layout, Clipboard, Package } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import prisma from "@/app/lib/prisma"

interface Move {
  id: string
  title: string
  fromAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  toAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  description: string
  status: string
  moveDate: string
  moveType: string
  rooms: number
  floors: number
  squareFeet: number
}

interface ItemList {
  id: string
  name: string
  description: string
  itemCount: number
}

interface Task {
  id: string
  title: string
  description: string
  status: string
  dueDate: string
  assignedTo: string
}

interface Supply {
  id: string
  name: string
  quantity: number
  status: string
}

export default async function MoveDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null // or redirect to login
  }

  // Fetch move data
  const move = await prisma.move.findUnique({
    where: {
      id: params.id,
      userId: session.user.id
    }
  })

  if (!move) {
    return null // or show error
  }

  // Fetch item lists
  const itemLists = await prisma.itemList.findMany({
    where: {
      moveId: params.id
    }
  })

  // Fetch tasks
  const tasks = await prisma.task.findMany({
    where: {
      moveId: params.id
    },
    include: {
      assignedTo: {
        select: {
          name: true
        }
      }
    }
  })

  // Fetch supplies
  const supplies = await prisma.supply.findMany({
    where: {
      moveId: params.id
    }
  })

  // Format data for display
  const formattedMove: Move = {
    id: move.id,
    title: move.title,
    fromAddress: {
      street: move.fromStreet,
      city: move.fromCity,
      state: move.fromState,
      zipCode: move.fromZipCode,
      country: move.fromCountry || "USA"
    },
    toAddress: {
      street: move.toStreet,
      city: move.toCity,
      state: move.toState,
      zipCode: move.toZipCode,
      country: move.toCountry || "USA"
    },
    description: move.description || "",
    status: move.status,
    moveDate: move.moveDate.toISOString().split('T')[0],
    moveType: move.moveType,
    rooms: move.rooms || 0,
    floors: move.floors || 0,
    squareFeet: move.squareFeet || 0
  }

  const formattedItemLists: ItemList[] = itemLists.map((list: { id: string; name: string; description: string | null; itemCount: number | null }) => ({
    id: list.id,
    name: list.name,
    description: list.description || "",
    itemCount: list.itemCount || 0
  }))

  const formattedTasks: Task[] = tasks.map((task: { id: string; title: string; description: string | null; status: string; dueDate: Date; assignedTo: { name: string | null } | null }) => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: task.status,
    dueDate: task.dueDate.toISOString().split('T')[0],
    assignedTo: task.assignedTo?.name || "Unassigned"
  }))

  const formattedSupplies: Supply[] = supplies.map((supply: { id: string; name: string; quantity: number; status: string }) => ({
    id: supply.id,
    name: supply.name,
    quantity: supply.quantity,
    status: supply.status
  }))

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  return (
    <div className="container py-10">
      <Breadcrumb />
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 rounded-full">
          <Link href="/dashboard/move">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Moves
          </Link>
        </Button>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">{formattedMove.title}</h1>
            <p className="text-muted-foreground">Moving on {formattedMove.moveDate}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild className="rounded-full">
              <Link href={`/dashboard/move/${params.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit Move
              </Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href={`/dashboard/move/${params.id}/item-lists/create`}>
                <Plus className="mr-2 h-4 w-4" /> Add Item List
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="rounded-full p-1">
          <TabsTrigger value="overview" className="rounded-full">
            Overview
          </TabsTrigger>
          <TabsTrigger value="items" className="rounded-full">
            Items
          </TabsTrigger>
          <TabsTrigger value="tasks" className="rounded-full">
            Tasks
          </TabsTrigger>
          <TabsTrigger value="supplies" className="rounded-full">
            Supplies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Move Details</CardTitle>
                <CardDescription>Basic information about the move</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">From</h3>
                    <p className="text-sm text-muted-foreground">
                      {formattedMove.fromAddress.street}, {formattedMove.fromAddress.city}, {formattedMove.fromAddress.state} {formattedMove.fromAddress.zipCode}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">To</h3>
                    <p className="text-sm text-muted-foreground">
                      {formattedMove.toAddress.street}, {formattedMove.toAddress.city}, {formattedMove.toAddress.state} {formattedMove.toAddress.zipCode}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Description</h3>
                    <p className="text-sm text-muted-foreground">{formattedMove.description}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Move Type</h3>
                    <p className="text-sm text-muted-foreground">{formattedMove.moveType}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Property Details</h3>
                    <p className="text-sm text-muted-foreground">
                      {formattedMove.rooms} rooms, {formattedMove.floors} floors, {formattedMove.squareFeet} sq ft
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>Current status of the move</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Current Status</h3>
                    <Badge variant="outline" className="mt-1">
                      {formatStatus(formattedMove.status)}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Move Date</h3>
                    <p className="text-sm text-muted-foreground">{formattedMove.moveDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {formattedItemLists.map((list) => (
              <Card key={list.id}>
                <CardHeader>
                  <CardTitle>{list.name}</CardTitle>
                  <CardDescription>{list.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Items</span>
                    <span className="text-sm font-medium">{list.itemCount}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {formattedTasks.map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <CardTitle>{task.title}</CardTitle>
                  <CardDescription>{task.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant="outline">{formatStatus(task.status)}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Due Date</span>
                      <span className="text-sm font-medium">{task.dueDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Assigned To</span>
                      <span className="text-sm font-medium">{task.assignedTo}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="supplies" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {formattedSupplies.map((supply) => (
              <Card key={supply.id}>
                <CardHeader>
                  <CardTitle>{supply.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Quantity</span>
                      <span className="text-sm font-medium">{supply.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant="outline">{formatStatus(supply.status)}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

