import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json(
        { error: "QR code is required" },
        { status: 400 }
      )
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { code },
      include: {
        move: {
          select: {
            userId: true,
            title: true,
            status: true
          }
        },
        item: {
          include: {
            itemList: {
              select: {
                name: true,
                room: true
              }
            }
          }
        },
        inventory: {
          select: {
            name: true,
            quantity: true
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

    return NextResponse.json({ qrCode })
  } catch (error) {
    console.error("Error looking up QR code:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function formatAddress(address: any) {
  return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`
} 