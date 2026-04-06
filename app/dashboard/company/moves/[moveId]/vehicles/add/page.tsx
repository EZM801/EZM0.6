import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { AddVehicleForm } from "@/app/dashboard/company/moves/components/add-vehicle-form"
import { BackButton } from "@/app/dashboard/company/moves/[moveId]/employees/add/components/BackButton"

interface PageProps {
  params: {
    moveId: string
  }
}

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export default async function AddVehiclePage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  if (session.user.userType !== "COMPANY") {
    redirect("/dashboard")
  }

  // Validate UUID
  if (!params.moveId || !isValidUUID(params.moveId)) {
    notFound()
  }

  try {
    // Verify the move belongs to the company
    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      }
    })

    if (!move) {
      notFound()
    }

    // Get all available vehicles for the company
    const availableVehicles = await prisma.vehicle.findMany({
      where: {
        companyId: session.user.companyId!,
        isAvailable: true
      },
      select: {
        id: true,
        name: true,
        type: true,
        licensePlate: true,
        capacity: true
      }
    })

    // Filter out vehicles that are already assigned to this move
    const assignedVehicles = await prisma.companyMoveVehicle.findMany({
      where: {
        moveId: params.moveId
      },
      select: {
        vehicleId: true
      }
    })

    const assignedVehicleIds = new Set(assignedVehicles.map(v => v.vehicleId))
    const filteredVehicles = availableVehicles.filter(v => !assignedVehicleIds.has(v.id))

    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Add Vehicle to Move</h1>
          <BackButton />
        </div>
        <Card className="p-6">
          <AddVehicleForm 
            moveId={params.moveId} 
            availableVehicles={filteredVehicles}
          />
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Error loading add vehicle page:", error)
    throw error
  }
} 