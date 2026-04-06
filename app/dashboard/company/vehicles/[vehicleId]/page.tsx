import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PageProps {
  params: {
    vehicleId: string
  }
}

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  if (session.user.userType !== "COMPANY") {
    redirect("/dashboard")
  }

  // Validate UUID
  if (!params.vehicleId || !isValidUUID(params.vehicleId)) {
    notFound()
  }

  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: params.vehicleId,
        companyId: session.user.companyId!
      },
      include: {
        moves: {
          include: {
            move: {
              select: {
                id: true,
                name: true,
                status: true,
                startDate: true,
                endDate: true
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        }
      }
    })

    if (!vehicle) {
      notFound()
    }

    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard/company/vehicles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Vehicles
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{vehicle.name}</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/company/vehicles/${vehicle.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Vehicle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/company/vehicles/${vehicle.id}/delete`}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Vehicle
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Vehicle Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{vehicle.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">License Plate</p>
                <p className="font-medium">{vehicle.licensePlate || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{vehicle.isAvailable ? "Available" : "In Use"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Capacity</p>
                <p className="font-medium">{vehicle.capacity ? `${vehicle.capacity} lbs` : "Not specified"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Move History</h2>
            <div className="space-y-4">
              {vehicle.moves.length > 0 ? (
                vehicle.moves.map((assignment) => (
                  <div key={assignment.id} className="p-4 bg-gray-50 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{assignment.move.name}</p>
                        <p className="text-sm text-gray-500">Status: {assignment.move.status}</p>
                      </div>
                      <Button variant="ghost" asChild>
                        <Link href={`/dashboard/company/moves/${assignment.move.id}`}>
                          View Move
                        </Link>
                      </Button>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Start: {new Date(assignment.startDate).toLocaleDateString()}</p>
                      {assignment.endDate && (
                        <p>End: {new Date(assignment.endDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No move history available</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading vehicle details:", error)
    throw error
  }
} 