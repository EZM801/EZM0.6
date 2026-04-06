import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const [
      totalMoves,
      activeEmployees,
      equipmentCount,
      pendingTasks
    ] = await Promise.all([
      prisma.Move.count({
        where: { companyId: session.user.companyId }
      }),
      prisma.User.count({
        where: { 
          companyId: session.user.companyId,
          isActive: true
        }
      }),
      prisma.Equipment.count({
        where: { companyId: session.user.companyId }
      }),
      prisma.tasks.count({
        where: {
          move: { companyId: session.user.companyId },
          status: "pending"
        }
      })
    ])

    return NextResponse.json({
      totalMoves,
      activeEmployees,
      equipmentCount,
      pendingTasks
    })
  } catch (error) {
    console.error("Failed to fetch company stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
} 