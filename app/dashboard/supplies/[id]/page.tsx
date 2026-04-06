"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb } from "@/components/breadcrumb"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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

export default function SupplyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [supply, setSupply] = useState<Supply | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSupply = async () => {
      try {
        const response = await fetch(`/api/supplies/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch supply")
        }
        const data = await response.json()
        setSupply(data)
      } catch (error) {
        console.error("Error fetching supply:", error)
        toast.error("Failed to load supply details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSupply()
  }, [params.id])

  const handleDelete = async () => {
    if (!supply) return

    try {
      const response = await fetch(`/api/supplies/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete supply")
      }

      toast.success("Supply deleted successfully")
      router.push("/dashboard/supplies")
    } catch (error) {
      console.error("Error deleting supply:", error)
      toast.error("Failed to delete supply")
    }
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <Breadcrumb />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </div>
      </div>
    )
  }

  if (!supply) {
    return (
      <div className="container py-10">
        <Breadcrumb />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Supply Not Found</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Supply Not Found</CardTitle>
              <CardDescription>
                The supply you are looking for does not exist or you don't have permission to view it.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href="/dashboard/supplies">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Supplies
                </Link>
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
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
              <Link href="/dashboard/supplies">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{supply.name}</h1>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/dashboard/supplies/${supply.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Supply Details</CardTitle>
            <CardDescription>{supply.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                  <p>{supply.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Unit</h3>
                  <p>{supply.unit}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Quantity in Stock</h3>
                  <p>{supply.quantityInStock}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <p>{supply.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 