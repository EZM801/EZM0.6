import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { moveId: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // First verify the move belongs to the user
    const move = await prisma.move.findFirst({
      where: {
        id: params.moveId,
        userId: session.user.id
      }
    })

    if (!move) {
      return new NextResponse("Move not found", { status: 404 })
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.taskId,
        moveId: params.moveId
      }
    })

    if (!task) {
      return new NextResponse("Task not found", { status: 404 })
    }

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error("[TASK_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { moveId: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // First verify the move belongs to the user
    const move = await prisma.move.findFirst({
      where: {
        id: params.moveId,
        userId: session.user.id
      }
    })

    if (!move) {
      return new NextResponse("Move not found", { status: 404 })
    }

    const body = await request.json()

    const task = await prisma.task.update({
      where: {
        id: params.taskId,
        moveId: params.moveId
      },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error("[TASK_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Verify task belongs to user's move
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.taskId,
        moveId: params.moveId,
        move: {
          userId: session.user.id,
        },
      },
    })

    if (!existingTask) {
      return new NextResponse("Task not found", { status: 404 })
    }

    await prisma.task.delete({
      where: {
        id: params.taskId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TASK_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 