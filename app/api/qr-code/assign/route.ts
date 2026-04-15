import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { code, type, entityId } = body

    // Validate input
    if (!code || !type || !entityId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // For items, verify the code exists and is pre-printed
    if (type === "item") {
      const existingCode = await prisma.qRCode.findUnique({
        where: { code },
      })

      if (!existingCode || !existingCode.isPrePrinted) {
        return NextResponse.json(
          { error: "Invalid item QR code" },
          { status: 400 }
        )
      }

      if (existingCode.status === "active") {
        return NextResponse.json(
          { error: "QR code is already in use" },
          { status: 400 }
        )
      }
    }

    // Verify entity exists and user has access
    const entity = await prisma[type].findUnique({
      where: { id: entityId },
      include: {
        ...(type === "item" && {
          itemList: {
            include: {
              move: {
                select: {
                  userId: true
                }
              }
            }
          }
        }),
        ...(type === "itemList" && {
          move: {
            select: {
              userId: true
            }
          }
        }),
        ...(type === "move" && {
          user: {
            select: {
              id: true
            }
          }
        })
      }
    })

    if (!entity) {
      return NextResponse.json(
        { error: "Entity not found" },
        { status: 404 }
      )
    }

    // Verify user has access to the entity
    const hasAccess = type === 'move' 
      ? entity.userId === session.user.id 
      : type === 'item'
        ? entity.itemList.move.userId === session.user.id
        : entity.move.userId === session.user.id

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Create or update QR code
    const qrCode = await prisma.qRCode.upsert({
      where: { code },
      update: {
        type,
        status: "active",
        assignedAt: new Date(),
        ...(type === "move" && { moveId: entityId }),
        ...(type === "itemList" && { itemlistId: entityId }),
        ...(type === "item" && { itemId: entityId }),
      },
      create: {
        code,
        type,
        isPrePrinted: type === "item",
        status: "active",
        assignedAt: new Date(),
        userId: session.user.id,
        ...(type === "move" && { moveId: entityId }),
        ...(type === "itemList" && { itemlistId: entityId }),
        ...(type === "item" && { itemId: entityId }),
      },
      include: {
        move: true,
        item: true,
        inventory: true
      }
    })

    return NextResponse.json({ qrCode })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to assign QR code" },
      { status: 500 }
    )
  }
} 