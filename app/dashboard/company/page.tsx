import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CompanyDashboard } from "@/components/company-dashboard"
import { authOptions } from "@/lib/auth"

export default async function CompanyDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  // Ensure user is a company user
  if (session.user.userType !== "COMPANY") {
    redirect("/dashboard")
  }

  // Fetch dashboard stats
  const [
    activeMoves,
    completedMoves,
    employees,
    inventory,
    upcomingMoves,
  ] = await prisma.$transaction([
    prisma.move.count({
      where: {
        status: "IN_PROGRESS",
      },
    }),
    prisma.move.count({
      where: {
        status: "COMPLETED",
      },
    }),
    prisma.user.count({
      where: {
        role: {
          in: ["WORKER", "FOREMAN"],
        },
      },
    }),
    prisma.item.count(),
    prisma.move.count({
      where: {
        status: "SCHEDULED",
        createdAt: {
          gte: new Date(),
        },
      },
    }),
  ])

  // Fetch recent moves with related data
  const moves = await prisma.move.findMany({
    where: {
      status: "IN_PROGRESS",
    },
    include: {
      fromAddress: true,
      toAddress: true,
      collaborators: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 5,
  })

  // Format moves data
  const formattedMoves = moves.map((move) => ({
    id: move.id,
    client: move.name,
    fromAddress: {
      street: move.fromAddress?.street || "",
      city: move.fromAddress?.city || "",
      state: move.fromAddress?.state || "",
      zipCode: move.fromAddress?.zipCode || "",
    },
    toAddress: {
      street: move.toAddress?.street || "",
      city: move.toAddress?.city || "",
      state: move.toAddress?.state || "",
      zipCode: move.toAddress?.zipCode || "",
    },
    moveDate: move.createdAt.toLocaleDateString(),
    status: move.status,
    team: move.collaborators.map((collab) => collab.user.firstName || collab.user.lastName || "Unknown"),
    progress: Math.floor(Math.random() * 100), // This should be calculated based on actual progress
  }))

  // Fetch schedule
  const schedule = await prisma.move.findMany({
    where: {
      status: "SCHEDULED",
      createdAt: {
        gte: new Date(),
      },
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 10,
  })

  // Format schedule data
  const formattedSchedule = schedule.map((move) => ({
    id: move.id,
    title: move.name,
    time: move.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: move.createdAt.toDateString() === new Date().toDateString() ? "Today" : "Tomorrow",
  }))

  const stats = {
    activeMoves,
    completedMoves,
    employees,
    inventory,
    revenue: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(0), // TODO: Implement actual revenue calculation
    upcomingMoves,
  }

  return (
    <CompanyDashboard
      stats={stats}
      moves={formattedMoves}
      schedule={formattedSchedule}
    />
  )
}

