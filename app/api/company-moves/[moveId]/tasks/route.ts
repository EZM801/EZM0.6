import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const taskSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = taskSchema.parse(json)

    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId,
      },
    })

    if (!move) {
      return new NextResponse("Move not found", { status: 404 })
    }

    const task = await prisma.companyMoveTask.create({
      data: {
        name: body.name,
        description: body.description,
        priority: body.priority,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: "TODO",
        moveId: params.moveId,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("[TASK_CREATE]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId,
      },
      include: {
        tasks: true,
      },
    })

    if (!move) {
      return new NextResponse("Move not found", { status: 404 })
    }

    return NextResponse.json(move.tasks)
  } catch (error) {
    console.error("[TASKS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 