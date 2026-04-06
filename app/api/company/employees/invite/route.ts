import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { randomBytes } from "crypto"
import QRCode from "qrcode"

const inviteSchema = z.object({
  companyName: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (session.user.userType !== "COMPANY") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Generate invitation token
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Create invitation record
    const invitation = await prisma.companyInvite.create({
      data: {
        token,
        expires,
        companyId: session.user.companyId,
        createdById: session.user.id,
      }
    })

    // Create QR code data
    const qrData = {
      type: 'company_invite',
      token: invitation.token,
      companyId: session.user.companyId,
      expires: expires.toISOString(),
    }

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })

    return NextResponse.json({ 
      success: true,
      qrCode: qrCodeDataUrl,
      expiresAt: expires,
    })
  } catch (error) {
    console.error("[COMPANY_INVITE_QR]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 