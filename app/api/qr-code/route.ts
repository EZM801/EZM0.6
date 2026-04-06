import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const type = searchParams.get("type")

    if (!code) {
      return NextResponse.json({ error: "QR code is required" }, { status: 400 })
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { code },
      include: {
        move: true,
        inventory: true,
        user: true,
        item: true
      }
    })

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 })
    }

    if (type && qrCode.type !== type) {
      return NextResponse.json({ error: "Invalid QR code type" }, { status: 400 })
    }

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error("Error fetching QR code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { code, type, moveId, inventoriesId, userId, itemId } = body

    if (!code || !type) {
      return NextResponse.json({ error: "Code and type are required" }, { status: 400 })
    }

    const qrCode = await prisma.qRCode.create({
      data: {
        code,
        type,
        moveId,
        inventoriesId,
        userId,
        itemId,
        status: "active"
      }
    })

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error("Error creating QR code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { code, status, isPacked, isLoaded, isDelivered, isUnpacked } = body

    if (!code) {
      return NextResponse.json({ error: "QR code is required" }, { status: 400 })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (isPacked !== undefined) {
      updateData.isPacked = isPacked
      if (isPacked) updateData.packedAt = new Date()
    }
    if (isLoaded !== undefined) {
      updateData.isLoaded = isLoaded
      if (isLoaded) updateData.loadedAt = new Date()
    }
    if (isDelivered !== undefined) {
      updateData.isDelivered = isDelivered
      if (isDelivered) updateData.deliveredAt = new Date()
    }
    if (isUnpacked !== undefined) updateData.isUnpacked = isUnpacked

    const qrCode = await prisma.qRCode.update({
      where: { code },
      data: updateData
    })

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error("Error updating QR code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "QR code is required" }, { status: 400 })
    }

    await prisma.qRCode.delete({
      where: { code }
    })

    return NextResponse.json({ message: "QR code deleted successfully" })
  } catch (error) {
    console.error("Error deleting QR code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 