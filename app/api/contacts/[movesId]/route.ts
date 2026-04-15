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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contact = await prisma.contact.findUnique({
      where: { id: params.moveId }
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error("[CONTACT_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 