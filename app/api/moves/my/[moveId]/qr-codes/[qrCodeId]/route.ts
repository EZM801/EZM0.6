import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import prisma from "@/app/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { moveId: string; qrCodeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const qrCode = await prisma.qrCode.findFirst({
      where: {
        id: params.qrCodeId,
        moveId: params.moveId,
        move: {
          userId: session.user.id,
        },
      },
    })

    if (!qrCode) {
      return new NextResponse("QR Code not found", { status: 404 })
    }

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error("[QR_CODE_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { moveId: string; qrCodeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const { name, description, type, status, data } = json

    // Verify QR code belongs to user's move
    const existingQrCode = await prisma.qrCode.findFirst({
      where: {
        id: params.qrCodeId,
        moveId: params.moveId,
        move: {
          userId: session.user.id,
        },
      },
    })

    if (!existingQrCode) {
      return new NextResponse("QR Code not found", { status: 404 })
    }

    const qrCode = await prisma.qrCode.update({
      where: {
        id: params.qrCodeId,
      },
      data: {
        name,
        description,
        type,
        status,
        data,
      },
    })

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error("[QR_CODE_PATCH]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string; qrCodeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Verify QR code belongs to user's move
    const existingQrCode = await prisma.qrCode.findFirst({
      where: {
        id: params.qrCodeId,
        moveId: params.moveId,
        move: {
          userId: session.user.id,
        },
      },
    })

    if (!existingQrCode) {
      return new NextResponse("QR Code not found", { status: 404 })
    }

    await prisma.qrCode.delete({
      where: {
        id: params.qrCodeId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[QR_CODE_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 