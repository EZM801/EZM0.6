import { NextResponse } from "next/server"
import prisma from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const json = await request.json()
    const { name, description, dueDate, priority, status, moveId } = json

    if (!name || !moveId) {
      return NextResponse.json(
        { success: false, error: { message: 'Name and moveId are required' } },
        { status: 400 }
      )
    }

    // Verify user has access to the move
    const move = await prisma.move.findFirst({
      where: {
        id: moveId,
        OR: [
          { userId: session.user.id },
          { company: { users: { some: { id: session.user.id } } } }
        ]
      }
    })

    if (!move) {
      return NextResponse.json(
        { success: false, error: { message: 'Move not found or access denied' } },
        { status: 403 }
      )
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        name,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'normal',
        status: status || 'pending',
        moveId,
        userId: session.user.id,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error('[TASKS_POST]', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const moveId = searchParams.get('moveId')

    const tasks = await prisma.task.findMany({
      where: {
        moveId: moveId || undefined,
        OR: [
          { userId: session.user.id },
          { moveId: { in: await getMoveIdsForUser(session.user.id) } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ success: true, tasks })
  } catch (error) {
    console.error('[TASKS_GET]', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const json = await request.json()
    const { id, name, description, dueDate, priority, status } = json

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: 'Task ID is required' } },
        { status: 400 }
      )
    }

    // Verify user has access to the task
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          { moveId: { in: await getMoveIdsForUser(session.user.id) } }
        ]
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: { message: 'Task not found or access denied' } },
        { status: 403 }
      )
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        status,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true, task: updatedTask })
  } catch (error) {
    console.error('[TASKS_PATCH]', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: 'Task ID is required' } },
        { status: 400 }
      )
    }

    // Verify user has access to the task
    const task = await prisma.task.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          { moveId: { in: await getMoveIdsForUser(session.user.id) } }
        ]
      }
    })

    if (!task) {
      return NextResponse.json(
        { success: false, error: { message: 'Task not found or access denied' } },
        { status: 403 }
      )
    }

    // Delete task
    await prisma.task.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[TASKS_DELETE]', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// Helper function to get move IDs for a user
async function getMoveIdsForUser(userId: string): Promise<string[]> {
  const moves = await prisma.move.findMany({
    where: {
      OR: [
        { userId },
        { company: { users: { some: { id: userId } } } }
      ]
    },
    select: { id: true }
  })
  return moves.map(move => move.id)
}
