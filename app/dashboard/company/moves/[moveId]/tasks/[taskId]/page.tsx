import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface PageProps {
  params: {
    moveId: string
    taskId: string
  }
}

export default async function TaskDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.userType !== "COMPANY") {
    redirect("/dashboard")
  }

  const task = await prisma.companyMoveTask.findUnique({
    where: { id: params.taskId },
    include: {
      assignedTo: true,
      move: true,
    },
  })

  if (!task) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{task.name}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" aria-label="Edit Task">
              <span className="sr-only">Edit</span>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6-6 3.536 3.536a2 2 0 0 1 0 2.828l-7.072 7.072a2 2 0 0 1-2.828 0l-3.536-3.536a2 2 0 0 1 0-2.828l7.072-7.072a2 2 0 0 1 2.828 0z"/></svg>
            </Button>
          </div>
        </div>
        <div className="mb-2 text-muted-foreground">{task.description}</div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{task.status}</Badge>
          <Badge variant="outline">Priority: {task.priority}</Badge>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Assigned To:</span> {task.assignedTo?.name || "Unassigned"}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Start Date:</span> {task.startDate ? new Date(task.startDate).toLocaleString() : "-"}
        </div>
        <div className="mb-2">
          <span className="font-semibold">End Date:</span> {task.endDate ? new Date(task.endDate).toLocaleString() : "-"}
        </div>
        <div className="flex gap-2 mt-6">
          <Button variant="destructive">Delete</Button>
        </div>
      </Card>
    </div>
  )
} 