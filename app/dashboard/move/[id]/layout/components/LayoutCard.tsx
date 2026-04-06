"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/types/layout"

interface LayoutCardProps {
  layout: Layout
  moveId: string
}

export function LayoutCard({ layout, moveId }: LayoutCardProps) {
  const router = useRouter()

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/dashboard/move/${moveId}/layout/${layout.id}`)}
    >
      <CardHeader>
        <CardTitle>{layout.name}</CardTitle>
        <CardDescription>
          {layout.orientation === "origin" && "Origin Layout"}
          {layout.orientation === "destination" && "Destination Layout"}
          {layout.orientation === "stop" && "Stop Layout"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {layout.instructions && (
          <p className="text-sm text-muted-foreground">{layout.instructions}</p>
        )}
      </CardContent>
    </Card>
  )
} 