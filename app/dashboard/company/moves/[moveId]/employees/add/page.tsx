import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { AddEmployeeForm } from "./components/AddEmployeeForm"
import { BackButton } from "./components/BackButton"

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

export default async function AddEmployeePage({ params }: PageProps) {
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

    // Get all available employees for the company
    const availableEmployees = await prisma.user.findMany({
      where: {
        companyId: session.user.companyId!,
        userType: "COMPANY",
        role: {
          in: ["WORKER", "FOREMAN"]
        },
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    })

    // Filter out employees that are already assigned to this move
    const assignedEmployees = await prisma.companyMoveEmployee.findMany({
      where: {
        moveId: params.moveId
      },
      select: {
        employeeId: true
      }
    })

    const assignedEmployeeIds = new Set(assignedEmployees.map(e => e.employeeId))
    const filteredEmployees = availableEmployees.filter(emp => !assignedEmployeeIds.has(emp.id))

    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Add Employee to Move</h1>
          <BackButton />
        </div>
        <Card className="p-6">
          <AddEmployeeForm 
            moveId={params.moveId} 
            availableEmployees={filteredEmployees}
          />
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Error loading add employee page:", error)
    throw error
  }
} 