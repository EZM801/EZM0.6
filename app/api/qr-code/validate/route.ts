import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import { z } from "zod"

const validateSchema = z.object({
  code: z.string(),
  type: z.enum(["move", "item"]).default("item"),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = validateSchema.parse(json)

    // Check if QR code exists and get its status
    const qrCode = await prisma.qRCode.findUnique({
      where: { code: body.code },
      include: {
        move: {
          select: {
            userId: true,
          }
        },
        item: {
          include: {
            itemList: {
              include: {
                move: {
                  select: {
                    userId: true,
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 })
    }

    // Check ownership
    const isOwner = qrCode.userId === session.user.id ||
                   qrCode.move?.userId === session.user.id ||
                   qrCode.item?.itemList.move.userId === session.user.id

    if (!isOwner) {
      return NextResponse.json({
        valid: false,
        message: "QR code belongs to another user",
        status: "unauthorized"
      })
    }

    // Check if QR code is already in use
    if (qrCode.status === "used") {
      return NextResponse.json({
        valid: false,
        message: "QR code is already in use",
        status: "used",
        details: {
          type: qrCode.type,
          isPrePrinted: qrCode.isPrePrinted,
          lastScannedAt: qrCode.lastScannedAt,
          lastLocation: qrCode.lastLocation
        }
      })
    }

    // Check if QR code type matches
    if (qrCode.type !== body.type) {
      return NextResponse.json({
        valid: false,
        message: `This QR code is meant for ${qrCode.type} use`,
        status: "wrong_type"
      })
    }

    return NextResponse.json({
      valid: true,
      message: "QR code is valid and available",
      status: "valid",
      details: {
        type: qrCode.type,
        isPrePrinted: qrCode.isPrePrinted
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("[QR_VALIDATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 