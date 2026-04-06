import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

interface PageProps {
  params: {
    moveId: string
  }
}

export default async function EmployeesListPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.userType !== "COMPANY") {
    redirect("/dashboard")
  }

  const move = await prisma.companyMove.findUnique({
    where: { id: params.moveId },
    include: {
      employees: {
        include: {
          employee: true
        }
      }
    }
  })

  if (!move) {
    notFound()
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assigned Employees</h1>
          <p className="text-muted-foreground">Manage employees for this move</p>
        </div>
        <Button asChild className="rounded-full">
          <Link href={`/dashboard/company/moves/${params.moveId}/employees/add`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {move.employees.map(({ employee, role }) => (
          <Card key={employee.id} className="rounded-3xl soft-shadow p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">{employee.name}</div>
                <div className="text-muted-foreground text-sm">{employee.email}</div>
              </div>
              <Badge variant="outline">{role}</Badge>
            </div>
            <Button asChild variant="secondary" className="mt-2 w-full">
              <Link href={`/dashboard/company/moves/${params.moveId}/employees/${employee.id}`}>View Details</Link>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
} 