import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Edit, Trash2, QrCode, Image as ImageIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { UpdateEquipmentStatus } from "@/components/equipment/update-equipment-status"
import Image from "next/image"

interface PageProps {
  params: {
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

  // Validate UUID
  if (!params.equipmentId || !isValidUUID(params.equipmentId)) {
    notFound()
  }

  try {
    const equipment = await prisma.equipment.findFirst({
      where: {
        id: params.equipmentId,
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

    if (!equipment) {
      notFound()
    }

    // Type assertion to help TypeScript understand the equipment type
    const typedEquipment = equipment as typeof equipment & {
      status: string;
      imageUrl: string | null;
      qrCode: string | null;
    }

    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard/company/equipment">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Equipment
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{typedEquipment.name}</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/company/equipment/${typedEquipment.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Equipment
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/company/equipment/${typedEquipment.id}/delete`}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Equipment
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Equipment Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{typedEquipment.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={typedEquipment.isAvailable ? "default" : "destructive"}>
                      {typedEquipment.isAvailable ? "Available" : "In Use"}
                    </Badge>
                    <UpdateEquipmentStatus equipmentId={typedEquipment.id} currentStatus={typedEquipment.status} />
                  </div>
                </div>
                {typedEquipment.description && (
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="font-medium">{typedEquipment.description}</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Visual Assets</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Equipment Image</p>
                  {typedEquipment.imageUrl ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <Image
                        src={typedEquipment.imageUrl}
                        alt={typedEquipment.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 rounded-lg bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">QR Code</p>
                  {typedEquipment.qrCode ? (
                    <div className="relative w-48 h-48 mx-auto">
                      <Image
                        src={typedEquipment.qrCode}
                        alt="Equipment QR Code"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 mx-auto rounded-lg bg-gray-100 flex items-center justify-center">
                      <QrCode className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Move History</h2>
            <div className="space-y-4">
              {typedEquipment.moves.length > 0 ? (
                typedEquipment.moves.map((assignment) => (
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
                      <p>Quantity: {assignment.quantity}</p>
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
    console.error("Error loading equipment details:", error)
    throw error
  }
} 