import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { z } from "zod"

// Types
type NotificationType = "info" | "success" | "warning" | "error"

// Validation schemas
const createNotificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum(["info", "success", "warning", "error"]),
  userId: z.string().uuid("Invalid user ID")
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as NotificationType | null

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(type && { type })
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createNotificationSchema.parse(body)

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        title: validatedData.title,
        message: validatedData.message,
        type: validatedData.type,
        userId: validatedData.userId,
        status: "unread"
      }
    })

    return NextResponse.json({ notification })
  } catch (error) {
    console.error("[NOTIFICATIONS_POST]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, status } = body

    if (!notificationId || !status) {
      return NextResponse.json(
        { error: "Notification ID and status are required" },
        { status: 400 }
      )
    }

    // Verify notification access
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found or access denied" },
        { status: 403 }
      )
    }

    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { status }
    })

    return NextResponse.json({ notification: updatedNotification })
  } catch (error) {
    console.error("[NOTIFICATIONS_PATCH]", error)
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get("notificationId")

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      )
    }

    // Verify notification access
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found or access denied" },
        { status: 403 }
      )
    }

    // Delete notification
    const deletedNotification = await prisma.notification.delete({
      where: { id: notificationId }
    })

    return NextResponse.json({ notification: deletedNotification })
  } catch (error) {
    console.error("[NOTIFICATIONS_DELETE]", error)
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    )
  }
} 