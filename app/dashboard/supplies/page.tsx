"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, Search, ShoppingCart } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import prisma from "@/app/lib/prisma"

interface Supply {
  id: string
  name: string
  description: string | null
  category: string
  unit: string
  quantityInStock: number
  isActive: boolean
  companyId: string | null
}

export default async function SuppliesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null // or redirect to login
  }

  // Check if user has a company
  if (!session.user.companyId) {
    return (
      <div className="container py-10">
        <Breadcrumb />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Supplies</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>No Company Associated</CardTitle>
              <CardDescription>
                You need to be associated with a company to manage supplies. Please contact your administrator or create a company.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href="/dashboard/company">Create Company</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // Fetch supplies
  const supplies = await prisma.supply.findMany({
    where: {
      companyId: session.user.companyId,
      isActive: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  // Format data for display
  const formattedSupplies: Supply[] = supplies.map((supply) => ({
    id: supply.id,
    name: supply.name,
    description: supply.description,
    category: supply.category,
    unit: supply.unit,
    quantityInStock: supply.quantityInStock,
    isActive: supply.isActive,
    companyId: supply.companyId
  }))

  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredSupplies = formattedSupplies.filter((supply) => {
    const matchesSearch =
      supply.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supply.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeTab === "all" || supply.category === activeTab
    return matchesSearch && matchesCategory
  })

  // Show empty state if no supplies
  if (formattedSupplies.length === 0) {
    return (
      <div className="container py-10">
        <Breadcrumb />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Supplies</h1>
            <Button asChild>
              <Link href="/dashboard/supplies/new">Add Supply</Link>
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>No Supplies Found</CardTitle>
              <CardDescription>
                Your company doesn't have any supplies yet. Add your first supply to get started.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href="/dashboard/supplies/new">Add First Supply</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Breadcrumb />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Supplies</h1>
          <Button asChild>
            <Link href="/dashboard/supplies/new">Add Supply</Link>
              </Button>
          </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSupplies.map((supply) => (
            <Card key={supply.id}>
                <CardHeader>
                  <CardTitle>{supply.name}</CardTitle>
                  <CardDescription>{supply.description}</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <span>{supply.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Unit:</span>
                    <span>{supply.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quantity:</span>
                    <span>{supply.quantityInStock}</span>
                    </div>
                  </div>
                </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/dashboard/supplies/${supply.id}`}>View Details</Link>
                </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
      </div>
    </div>
  )
}

