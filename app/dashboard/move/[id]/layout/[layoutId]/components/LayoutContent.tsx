"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Layout, Room } from "@/types/layout"
import { useLayouts } from "@/app/hooks/use-layouts"
import { LayoutHeader } from "./LayoutHeader"
import { RoomGrid } from "./RoomGrid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface LayoutContentProps {
  moveId: string
  layoutId: string
}

export default function LayoutContent({ moveId, layoutId }: LayoutContentProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const { useLayoutQuery, useUpdateLayoutMutation } = useLayouts()
  const { data: layout, isLoading: isLoadingLayout } = useLayoutQuery(moveId, layoutId)
  const updateLayoutMutation = useUpdateLayoutMutation()

  const handleUpdateLayout = async (data: Partial<Layout>) => {
    if (!layout) return

    try {
      await updateLayoutMutation.mutateAsync({
        moveId,
        layoutId: layout.id,
        data
      })
    } catch (error) {
      console.error("Error updating layout:", error)
    }
  }

  if (isLoadingLayout) {
    return (
      <div className="container py-10">
        <Breadcrumb />
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <Breadcrumb />
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!layout) {
    return (
      <div className="container py-10">
        <Breadcrumb />
        <Alert variant="destructive">
          <AlertDescription>Layout not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Breadcrumb />
      <LayoutHeader layout={layout} />
      <div className="mt-6">
        <RoomGrid layout={layout} onUpdateLayout={handleUpdateLayout} />
      </div>
    </div>
  )
} 