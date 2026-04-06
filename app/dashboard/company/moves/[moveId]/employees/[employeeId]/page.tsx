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
    employeeId: string
  }
}

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export default async function EmployeeDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  if (session.user.userType !== "COMPANY") {
    redirect("/dashboard")
  }

  // Validate UUIDs
  if (!params.moveId || !params.employeeId || !isValidUUID(params.moveId) || !isValidUUID(params.employeeId)) {
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

    const moveEmployee = await prisma.companyMoveEmployee.findFirst({
      where: {
        moveId: params.moveId,
        employeeId: params.employeeId,
      },
      include: {
        employee: true,
      },
    })

    if (!moveEmployee) {
      notFound()
    }

    const { employee, role, startDate, endDate } = moveEmployee

    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/company/moves/${move.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Move
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{employee.name}</h1>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Employee Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{employee.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{employee.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{employee.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Move Assignment</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Role in Move</p>
                  <p className="font-medium">{role}</p>
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
    console.error("Error loading employee details:", error)
    throw error
  }
} 