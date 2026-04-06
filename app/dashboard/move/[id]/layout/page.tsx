"use client"

import { Suspense } from "react"
import { Layout } from "@prisma/client"
import { useLayouts } from "@/app/hooks/useLayout"
import { Breadcrumb } from "@/components/breadcrumb"
import { CreateLayoutDialog } from "./components/CreateLayoutDialog"
import { LayoutCard } from "./components/LayoutCard"
import { Skeleton } from "@/components/ui/skeleton"

interface LayoutPageProps {
  params: {
    id: string
  }
}

export default function LayoutPage({ params }: LayoutPageProps) {
  const { data: layouts, isLoading } = useLayouts(params.id)

  if (isLoading) {
    return (
      <div className="container py-10">
        <Breadcrumb />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Breadcrumb />
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Layouts</h1>
          <CreateLayoutDialog moveId={params.id} />
        </div>
      </div>

      {(!layouts || layouts.length === 0) ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <h2 className="text-xl font-semibold text-muted-foreground">No layouts found</h2>
          <p className="text-muted-foreground">Create a layout to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {layouts.map((layout) => (
            <LayoutCard key={layout.id} layout={layout} moveId={params.id} />
          ))}
        </div>
      )}
    </div>
  )
} 