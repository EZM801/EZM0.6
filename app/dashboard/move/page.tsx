"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, MapPin, Truck, Home } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import prisma from "@/app/lib/prisma"

interface Move {
  id: string
  name: string
  description: string | null
  status: string
  startDate: Date | null
  endDate: Date | null
  fromAddress: {
    street: string
    city: string
    state: string
    zipCode: string
  } | null
  toAddress: {
    street: string
    city: string
    state: string
    zipCode: string
  } | null
}

export default async function MovesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null // or redirect to login
  }

  // Fetch moves
  const moves = await prisma.move.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      fromAddress: true,
      toAddress: true
    },
    orderBy: {
      startDate: 'desc'
    }
  })

  // Format data for display
  const formattedMoves: Move[] = moves.map((move) => ({
    id: move.id,
    name: move.name,
    description: move.description,
    status: move.status,
    startDate: move.startDate,
    endDate: move.endDate,
    fromAddress: move.fromAddress ? {
      street: move.fromAddress.street,
      city: move.fromAddress.city,
      state: move.fromAddress.state,
      zipCode: move.fromAddress.zipCode
    } : null,
    toAddress: move.toAddress ? {
      street: move.toAddress.street,
      city: move.toAddress.city,
      state: move.toAddress.state,
      zipCode: move.toAddress.zipCode
    } : null
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
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Moves</h1>
          <p className="text-muted-foreground">Manage your moves and track their progress</p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/move/create">
            <Plus className="mr-2 h-4 w-4" /> Add Move
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {formattedMoves.map((move) => (
          <Card key={move.id} className="border-none rounded-3xl soft-shadow">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>{move.name}</CardTitle>
                    <Badge variant="outline" className="rounded-full">
                      {formatStatus(move.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Moving on {move.startDate?.toISOString().split('T')[0]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-full" asChild>
                    <Link href={`/dashboard/move/${move.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full" asChild>
                    <Link href={`/dashboard/move/${move.id}`}>
                      <Truck className="mr-2 h-4 w-4" /> View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Home className="h-4 w-4" />
                    From
                  </div>
                  <p className="text-sm">
                    {move.fromAddress ? (
                      `${move.fromAddress.street}, ${move.fromAddress.city}, ${move.fromAddress.state} ${move.fromAddress.zipCode}`
                    ) : (
                      <span className="text-muted-foreground">Not specified</span>
                    )}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MapPin className="h-4 w-4" />
                    To
                  </div>
                  <p className="text-sm">
                    {move.toAddress ? (
                      `${move.toAddress.street}, ${move.toAddress.city}, ${move.toAddress.state} ${move.toAddress.zipCode}`
                    ) : (
                      <span className="text-muted-foreground">Not specified</span>
                    )}
                  </p>
                </div>
              </div>
              {move.description && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{move.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

