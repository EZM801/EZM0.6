import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Users, Truck, Wrench, Calendar, MapPin, Phone, Mail, DollarSign, Clock, ListChecks, LayoutGrid, Package, MoreVertical, Pencil, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoveHeader } from "./components/MoveHeader"

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

export default async function MoveDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  if (session.user.userType !== "COMPANY") {
    redirect("/dashboard")
  }

  // Validate UUID
  if (!params.moveId || !isValidUUID(params.moveId)) {
    console.log("Invalid UUID:", params.moveId);
    notFound()
  }

  try {
    console.log("Fetching move details for ID:", params.moveId);
    console.log("Company ID:", session.user.companyId);

    // Get move details with all assigned resources
    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      },
      include: {
        fromAddress: true,
        toAddress: true,
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true
              }
            }
          },
          orderBy: {
            startDate: 'asc'
          }
        },
        employees: {
          where: {
            employee: {
              isActive: true
            }
          },
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true
              }
            }
          }
        },
        vehicles: {
          include: {
            vehicle: {
              select: {
                id: true,
                name: true,
                type: true,
                licensePlate: true,
                capacity: true,
                isAvailable: true
              }
            }
          }
        },
        equipment: {
          include: {
            equipment: {
              select: {
                id: true,
                name: true,
                type: true,
                isAvailable: true
              }
            }
          }
        },
        layouts: {
          include: {
            rooms: {
              include: {
                originItems: true,
                destinationItems: true,
                stopItems: true
              }
            }
          }
        },
        itemLists: {
          include: {
            items: {
              include: {
                originRoom: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                destinationRoom: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    console.log("Move found:", move ? "yes" : "no");

    if (!move) {
      console.log("Move not found, redirecting to 404");
      notFound()
    }

    return (
      <div className="container mx-auto py-8">
        <MoveHeader move={move} />

        {/* Move Details */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Move Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{move.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Priority</p>
              <p className="font-medium">{move.priority}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Move Type</p>
              <p className="font-medium">{move.moveType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">{new Date(move.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-medium">{move.endDate ? new Date(move.endDate).toLocaleDateString() : "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estimated Budget</p>
              <p className="font-medium">{move.estimatedBudget ? `$${move.estimatedBudget}` : "Not set"}</p>
            </div>
          </div>
        </Card>

        {/* Addresses */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Addresses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">From Address</h3>
              {move.fromAddress ? (
                <div className="space-y-1">
                  <p>{move.fromAddress.street}</p>
                  <p>{move.fromAddress.city}, {move.fromAddress.state} {move.fromAddress.zipCode}</p>
                  {move.fromAddress.floorNumber && <p>Floor {move.fromAddress.floorNumber}</p>}
                  {move.fromAddress.specialInstructions && (
                    <p className="text-sm text-gray-500">Instructions: {move.fromAddress.specialInstructions}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No from address specified</p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">To Address</h3>
              {move.toAddress ? (
                <div className="space-y-1">
                  <p>{move.toAddress.street}</p>
                  <p>{move.toAddress.city}, {move.toAddress.state} {move.toAddress.zipCode}</p>
                  {move.toAddress.floorNumber && <p>Floor {move.toAddress.floorNumber}</p>}
                  {move.toAddress.specialInstructions && (
                    <p className="text-sm text-gray-500">Instructions: {move.toAddress.specialInstructions}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No to address specified</p>
              )}
            </div>
          </div>
        </Card>

        {/* Tasks */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Tasks</h2>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/company/moves/${move.id}/tasks/create`}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Task
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {move.tasks.map((task) => (
              <div key={task.id} className="p-4 bg-gray-50 rounded group relative">
                <p className="font-medium">{task.name}</p>
                <p className="text-sm text-gray-500">{task.description}</p>
                <div className="mt-2 flex items-center gap-4">
                  <Badge variant="outline">{task.status}</Badge>
                  <Badge variant="outline">{task.priority}</Badge>
                  {task.startDate && (
                    <p className="text-sm text-gray-500">
                      Start: {new Date(task.startDate).toLocaleDateString()}
                    </p>
                  )}
                  {task.endDate && (
                    <p className="text-sm text-gray-500">
                      End: {new Date(task.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {task.assignedTo && (
                  <p className="text-sm text-gray-500 mt-2">
                    Assigned to: {task.assignedTo.name}
                  </p>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/moves/${move.id}/tasks/${task.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/moves/${move.id}/tasks/${task.id}/edit`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/moves/${move.id}/tasks/${task.id}/delete`}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </Card>

        {/* Employees */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Assigned Employees</h2>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/company/moves/${move.id}/employees/add`}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Employee
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {move.employees.map((assignment) => (
              <div key={assignment.employee.id} className="p-4 bg-gray-50 rounded group relative">
                <p className="font-medium">{assignment.employee.name}</p>
                <p className="text-sm text-gray-500">Role: {assignment.role}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/employees/${assignment.employee.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/moves/${move.id}/employees/${assignment.employee.id}/edit`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Role
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/moves/${move.id}/employees/${assignment.employee.id}/remove`}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove from Move
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </Card>

        {/* Vehicles */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Assigned Vehicles</h2>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/company/moves/${move.id}/vehicles/add`}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Vehicle
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {move.vehicles.map((assignment) => (
              <div key={assignment.vehicle.id} className="p-4 bg-gray-50 rounded group relative">
                <p className="font-medium">{assignment.vehicle.name}</p>
                <p className="text-sm text-gray-500">Type: {assignment.vehicle.type}</p>
                <p className="text-sm text-gray-500">License Plate: {assignment.vehicle.licensePlate || "Not provided"}</p>
                <p className="text-sm text-gray-500">Start Date: {new Date(assignment.startDate).toLocaleDateString()}</p>
                {assignment.endDate && (
                  <p className="text-sm text-gray-500">End Date: {new Date(assignment.endDate).toLocaleDateString()}</p>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/vehicles/${assignment.vehicle.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/moves/${move.id}/vehicles/${assignment.vehicle.id}/edit`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/moves/${move.id}/vehicles/${assignment.vehicle.id}/remove`}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove from Move
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </Card>

        {/* Equipment */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Assigned Equipment</h2>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/company/moves/${move.id}/equipment/add`}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Equipment
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {move.equipment.map((equipment) => (
              <div key={equipment.equipment.id} className="p-4 bg-gray-50 rounded group relative">
                <p className="font-medium">{equipment.equipment.name}</p>
                <p className="text-sm text-gray-500">Type: {equipment.equipment.type}</p>
                <p className="text-sm text-gray-500">Start Date: {new Date(equipment.startDate).toLocaleDateString()}</p>
                {equipment.endDate && (
                  <p className="text-sm text-gray-500">End Date: {new Date(equipment.endDate).toLocaleDateString()}</p>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/equipment/${equipment.equipment.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/moves/${move.id}/equipment/${equipment.equipment.id}/edit`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/moves/${move.id}/equipment/${equipment.equipment.id}/remove`}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove from Move
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </Card>

        {/* Layouts */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Layouts</h2>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/company/moves/${move.id}/layouts/create`}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Layout
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {move.layouts.map((layout) => (
              <div key={layout.id} className="p-4 bg-gray-50 rounded group relative">
                <p className="font-medium">{layout.name}</p>
                {layout.instructions && (
                  <p className="text-sm text-gray-500">{layout.instructions}</p>
                )}
                <p className="text-sm text-gray-500">Orientation: {layout.orientation}</p>
                <p className="text-sm text-gray-500">Rooms: {layout.rooms.length}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/moves/${move.id}/layouts/${layout.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/moves/${move.id}/layouts/${layout.id}/edit`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/moves/${move.id}/layouts/${layout.id}/delete`}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </Card>

        {/* Item Lists */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Item Lists</h2>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/company/moves/${move.id}/item-lists/create`}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item List
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {move.itemLists.map((list) => (
              <div key={list.id} className="p-4 bg-gray-50 rounded group relative">
                <p className="font-medium">{list.name}</p>
                {list.description && (
                  <p className="text-sm text-gray-500">{list.description}</p>
                )}
                <p className="text-sm text-gray-500">Items: {list.items.length}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/moves/${move.id}/item-lists/${list.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/moves/${move.id}/item-lists/${list.id}/edit`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/moves/${move.id}/item-lists/${list.id}/delete`}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Error fetching move details:", error);
    throw error;
  }
}