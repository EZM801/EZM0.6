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
    equipmentId: string
  }
}

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export default async function EquipmentDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  if (session.user.userType !== "COMPANY") {
    redirect("/dashboard")
  }

  // Validate UUIDs
  if (!params.moveId || !params.equipmentId || !isValidUUID(params.moveId) || !isValidUUID(params.equipmentId)) {
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

    const moveEquipment = await prisma.companyMoveEquipment.findFirst({
      where: {
        moveId: params.moveId,
        equipmentId: params.equipmentId,
      },
      include: {
        equipment: true,
      },
    })

    if (!moveEquipment) {
      notFound()
    }

    const { equipment, quantity, startDate, endDate } = moveEquipment

    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/company/moves/${move.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Move
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{equipment.name}</h1>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Equipment Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{equipment.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{equipment.description || "No description"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{equipment.isAvailable ? "Available" : "In Use"}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Move Assignment</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-medium">{quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{new Date(startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{endDate ? new Date(endDate).toLocaleDateString() : "Not set"}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Error loading equipment details:", error)
    throw error
  }
} 