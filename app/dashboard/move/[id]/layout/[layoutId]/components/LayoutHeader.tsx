"use client"

import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { Layout } from "@/types/layout"

interface LayoutHeaderProps {
  layout: Layout
}

export function LayoutHeader({ layout }: LayoutHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">{layout.name}</h1>
    </div>
  )
} 