"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Box, MapPin, Truck, Home } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface Move {
  id: string
  name: string
  description: string | null
  startDate: string | null
  endDate: string | null
  status: string
  moveType: string
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
  stops: Array<{
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    arrivalDate: string | null
    departureDate: string | null
    notes: string | null
  }>
}

interface Supply {
  id: string
  name: string
  description: string | null
  category: string
  unit: string
  quantityInStock: number
  reorderPoint: number
  isActive: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [moves, setMoves] = useState<Move[]>([])
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingSupplies, setIsLoadingSupplies] = useState(true)

  useEffect(() => {
    fetchMoves()
    fetchSupplies()
  }, [])

  const fetchMoves = async () => {
    try {
      const response = await fetch("/api/moves")
      if (!response.ok) {
        throw new Error("Failed to fetch moves")
      }
      const { data } = await response.json()
      setMoves(data || [])
    } catch (error) {
      console.error("Error fetching moves:", error)
      toast({
        title: "Error",
        description: "Failed to load moves. Please try again.",
        variant: "destructive",
      })
      setMoves([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSupplies = async () => {
    try {
      const response = await fetch("/api/supplies")
      if (!response.ok) {
        throw new Error("Failed to fetch supplies")
      }
      const data = await response.json()
      if (!data.success) {
        throw new Error("Failed to fetch supplies")
      }
      setSupplies(data.data || [])
    } catch (error) {
      console.error("Error fetching supplies:", error)
      toast({
        title: "Error",
        description: "Failed to load supplies. Please try again.",
        variant: "destructive",
      })
      setSupplies([])
    } finally {
      setIsLoadingSupplies(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/moves/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete move")
      }

      setMoves(moves.filter((move) => move.id !== id))
      toast({
        title: "Success",
        description: "Move deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting move:", error)
      toast({
        title: "Error",
        description: "Failed to delete move. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatAddress = (address: { street: string; city: string; state: string; zipCode: string } | null) => {
    if (!address) return "Address not provided"
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`
  }

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Dashboard</h1>
          <p className="text-muted-foreground">Manage your moves and track your progress</p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/move/create">
            <Plus className="mr-2 h-4 w-4" /> Add Move
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="my-moves" className="space-y-6">
        <TabsList className="rounded-full p-1">
          <TabsTrigger value="my-moves" className="rounded-full">
            My Moves
          </TabsTrigger>
          <TabsTrigger value="supplies" className="rounded-full">
            Supplies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-moves" className="space-y-6">
          {isLoading ? (
            <Card className="border-none rounded-3xl soft-shadow">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Loading moves...</p>
              </CardContent>
            </Card>
          ) : moves.length === 0 ? (
            <Card className="border-none rounded-3xl soft-shadow">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="rounded-full bg-gradient-to-r from-gradient-start to-gradient-mid p-3">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No Moves yet</h3>
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground">
                  You haven&apos;t created any moves yet. Get started by adding your first move.
                </p>
                <Button asChild className="rounded-full">
                  <Link href="/dashboard/move/create">
                    <Plus className="mr-2 h-4 w-4" /> Add Move
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {moves.map((move) => (
                <Card key={move.id} className="border-none rounded-3xl soft-shadow card-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle>{move.name}</CardTitle>
                      <Badge variant={move.status === "draft" ? "outline" : "default"} className="rounded-full">
                        {move.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {move.startDate ? `Moving on ${format(new Date(move.startDate), "PPP")}` : "No date set"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">From:</p>
                        <p className="text-muted-foreground">{formatAddress(move.fromAddress)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-start gap-2">
                      <Home className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">To:</p>
                        <p className="text-muted-foreground">{formatAddress(move.toAddress)}</p>
                      </div>
                    </div>
                    {move.stops.length > 0 && (
                      <div className="mt-3">
                        <Separator className="my-2" />
                        <p className="font-medium">Stops:</p>
                        {move.stops.map((stop, index) => (
                          <p key={index} className="text-muted-foreground">
                            {index + 1}. {stop.name || `Stop ${index + 1}`} - {stop.address}, {stop.city}, {stop.state} {stop.zipCode}
                            {stop.arrivalDate && ` (Arriving: ${format(new Date(stop.arrivalDate), "PPP")})`}
                          </p>
                        ))}
                      </div>
                    )}
                    {move.description && (
                      <div className="mt-3">
                        <Separator className="my-2" />
                        <p className="font-medium">Notes:</p>
                        <p className="text-muted-foreground">{move.description}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild className="rounded-full">
                      <Link href={`/dashboard/move/${move.id}`}>View Details</Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href={`/dashboard/move/${move.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(move.id)}
                        className="rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="supplies" className="space-y-6">
          <Card className="border-none rounded-3xl soft-shadow">
            <CardHeader>
              <CardTitle className="gradient-text">Supplies</CardTitle>
              <CardDescription>Manage your moving supplies and inventory</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSupplies ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-4 text-muted-foreground">Loading supplies...</p>
                </div>
              ) : supplies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="rounded-full bg-gradient-to-r from-gradient-start to-gradient-mid p-3">
                    <Box className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No Supplies yet</h3>
                  <p className="mb-4 mt-2 text-center text-sm text-muted-foreground">
                    You haven&apos;t added any supplies yet. Get started by adding your first supply.
                  </p>
                  <Button asChild className="rounded-full">
                    <Link href="/supplies">
                      <Plus className="mr-2 h-4 w-4" /> Add Supply
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {supplies.map((supply) => (
                    <div key={supply.id} className="flex items-center justify-between rounded-2xl border p-4 card-hover">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-gradient-to-r from-gradient-start to-gradient-mid p-4">
                          <Box className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{supply.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {supply.description || supply.category || "No description"}
                          </p>
                        </div>
                      </div>
                      <Badge className="rounded-full">{supply.quantityInStock} {supply.unit}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="rounded-full">
                <Link href="/supplies">Manage Supplies</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


