import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const qrCodes = await prisma.qRCode.findMany({
      where: {
        moveId: params.moveId,
        move: {
          userId: session.user.id
        }
      },
      include: {
        item: true,
        inventory: true
      }
    })

    return NextResponse.json(qrCodes)
  } catch (error) {
    console.error("[QR_CODES_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()

    const qrCode = await prisma.qRCode.create({
      data: {
        code: body.code,
        type: body.type,
        isPrePrinted: body.isPrePrinted || false,
        status: body.status || "active",
        isPacked: body.isPacked || false,
        isLoaded: body.isLoaded || false,
        isDelivered: body.isDelivered || false,
        isUnpacked: body.isUnpacked || false,
        packedAt: body.packedAt ? new Date(body.packedAt) : null,
        loadedAt: body.loadedAt ? new Date(body.loadedAt) : null,
        deliveredAt: body.deliveredAt ? new Date(body.deliveredAt) : null,
        unpackedAt: body.unpackedAt ? new Date(body.unpackedAt) : null,
        lastLocation: body.lastLocation,
        lastScannedBy: body.lastScannedBy,
        lastScannedAt: body.lastScannedAt ? new Date(body.lastScannedAt) : null,
        assignedAt: body.assignedAt ? new Date(body.assignedAt) : null,
        moveId: params.moveId,
        itemId: body.itemId,
        inventoriesId: body.inventoriesId
      },
      include: {
        item: true,
        inventory: true
      }
    })

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error("[QR_CODES_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 