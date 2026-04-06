import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Briefcase, Clock } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Employee, CompanyMoveEmployee, CompanyMoveTask } from "@prisma/client"

interface PageProps {
  params: {
    id: string
  }
}

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export default async function EmployeeDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  if (session.user.userType !== "COMPANY") {
    redirect("/dashboard")
  }

  // Validate UUID
  if (!params.id || !isValidUUID(params.id)) {
    console.log("Invalid UUID:", params.id);
    notFound()
  }

  try {
    const employee = await prisma.employee.findFirst({
      where: {
        id: params.id,
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
        },
        tasks: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!employee) {
      notFound()
    }

    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 rounded-full">
            <Link href="/dashboard/company/employees">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Employees
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{employee.name}</h1>
              <p className="text-muted-foreground">{employee.role}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/company/employees/${employee.id}/edit`}>
                  Edit Employee
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/company/employees/${employee.id}/work`}>
                  View Work
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Employee Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Employee Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{employee.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{employee.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(employee.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Status: {employee.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <Tabs defaultValue="moves" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="moves">Moves</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="moves" className="space-y-4">
                {employee.moves.length > 0 ? (
                  employee.moves.map((assignment: CompanyMoveEmployee & { move: { id: string; name: string; status: string; startDate: Date; endDate: Date | null } }) => (
                    <div key={assignment.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <Link 
                          href={`/dashboard/company/moves/${assignment.move.id}`}
                          className="font-medium hover:underline"
                        >
                          {assignment.move.name}
                        </Link>
                        <Badge variant="outline">{assignment.move.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(assignment.startDate).toLocaleDateString()} - 
                        {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : "Present"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No moves assigned yet</p>
                )}
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                {employee.tasks.length > 0 ? (
                  employee.tasks.map((task: CompanyMoveTask) => (
                    <div key={task.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{task.name}</span>
                        <Badge variant="outline">{task.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {task.startDate ? new Date(task.startDate).toLocaleDateString() : "No start date"} - 
                        {task.endDate ? new Date(task.endDate).toLocaleDateString() : "No end date"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No tasks assigned</p>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching employee details:", error);
    throw error;
  }
} 