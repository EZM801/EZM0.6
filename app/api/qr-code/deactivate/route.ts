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
    const { code } = body

    // Verify QR code exists and user has access
    const qrCode = await prisma.qRCode.findUnique({
      where: { code },
      include: {
        move: {
          select: {
            userId: true
          }
        },
        item: {
          select: {
            itemList: {
              select: {
                move: {
                  select: {
                    userId: true
                  }
                }
              }
            }
          }
        },
        inventory: {
          select: {
            move: {
              select: {
                userId: true
              }
            }
          }
        }
      }
    })

    if (!qrCode) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      )
    }

    // Verify user has access to deactivate this QR code
    const hasAccess = qrCode.move?.userId === session.user.id ||
                     qrCode.item?.itemList?.move?.userId === session.user.id ||
                     qrCode.inventory?.move?.userId === session.user.id

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Deactivate QR code
    const updatedQRCode = await prisma.qRCode.update({
      where: { code },
      data: {
        status: "inactive",
        moveId: null,
        inventoryId: null,
        itemId: null
      }
    })

    return NextResponse.json({ qrCode: updatedQRCode })
  } catch (error) {
    console.error("QR code deactivation error:", error)
    return NextResponse.json(
      { error: "Failed to deactivate QR code" },
      { status: 500 }
    )
  }
} 