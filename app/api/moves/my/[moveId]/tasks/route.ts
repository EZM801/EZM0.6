import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const moveId = params.moveId
    if (!moveId) {
      return NextResponse.json(
        { success: false, error: "Move ID is required" },
        { status: 400 }
      )
    }

    // Verify the move belongs to the user
    const move = await prisma.move.findFirst({
      where: {
        id: moveId,
        userId: session.user.id
      }
    })

    if (!move) {
      return NextResponse.json(
        { success: false, error: "Move not found" },
        { status: 404 }
      )
    }

    // Fetch tasks for the move
    const tasks = await prisma.task.findMany({
      where: {
        moveId: moveId,
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format dates to ISO strings and ensure all fields match the frontend interface
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      name: task.name,
      description: task.description,
      status: task.status as 'pending' | 'in_progress' | 'completed',
      priority: task.priority as 'low' | 'normal' | 'high',
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      tasks: formattedTasks
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const moveId = params.moveId
    if (!moveId) {
      return NextResponse.json(
        { success: false, error: "Move ID is required" },
        { status: 400 }
      )
    }

    // Verify the move belongs to the user
    const move = await prisma.move.findFirst({
      where: {
        id: moveId,
        userId: session.user.id
      }
    })

    if (!move) {
      return NextResponse.json(
        { success: false, error: "Move not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { title, description, status, priority, dueDate } = body

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        name: title,
        description,
        status: status || "pending",
        priority: priority || "normal",
        moveId,
        userId: session.user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        updatedAt: new Date()
      }
    })

    // Format dates to ISO strings
    const formattedTask = {
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      dueDate: task.dueDate ? task.dueDate.toISOString() : null
    }

    return NextResponse.json({ 
      success: true, 
      task: formattedTask
    })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create task" },
      { status: 500 }
    )
  }
} 