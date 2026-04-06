import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: {
    moveId: string
    itemId: string
  }
}

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export default async function ItemDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  if (session.user.userType !== "COMPANY") {
    redirect("/dashboard")
  }

  // Validate UUIDs
  if (!params.moveId || !params.itemId || !isValidUUID(params.moveId) || !isValidUUID(params.itemId)) {
    notFound()
  }

  try {
    // First verify the move belongs to the company
    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      }
    })

    if (!move) {
      notFound()
    }

    const item = await prisma.companyItem.findFirst({
      where: {
        id: params.itemId,
        itemList: {
          moveId: params.moveId
        }
      },
      include: {
        originRoom: true,
        destinationRoom: true,
        stopRoom: true,
        itemList: true
      }
    })

    if (!item) {
      notFound()
    }

    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/company/moves/${move.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Move
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{item.name}</h1>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Item Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{item.description || "No description"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">{item.weight ? `${item.weight} lbs` : "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Value</p>
                  <p className="font-medium">{item.value ? `$${item.value}` : "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fragile</p>
                  <p className="font-medium">{item.isFragile ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Packing Status</p>
                  <p className="font-medium">{item.packingStatus}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Location Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Origin Room</p>
                  <p className="font-medium">{item.originRoom?.name || "Not assigned"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Destination Room</p>
                  <p className="font-medium">{item.destinationRoom?.name || "Not assigned"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stop Room</p>
                  <p className="font-medium">{item.stopRoom?.name || "Not assigned"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Item List</p>
                  <p className="font-medium">{item.itemList.name}</p>
                </div>
              </div>
            </div>
          </div>

          {item.specialInstructions && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Special Instructions</h2>
              <p className="text-gray-700">{item.specialInstructions}</p>
            </div>
          )}
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Error loading item details:", error)
    throw error
  }
} 