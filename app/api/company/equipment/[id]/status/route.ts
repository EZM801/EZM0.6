import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { authOptions } from "@/lib/auth"

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "MAINTENANCE", "REPAIR", "RETIRED"])
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.companyId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const validatedData = statusSchema.parse(body)

    const equipment = await prisma.equipment.update({
      where: {
        id: params.id,
        companyId: session.user.companyId
      },
      data: {
        isAvailable: validatedData.status === "ACTIVE"
      }
    })

    return NextResponse.json(equipment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }

    console.error("[EQUIPMENT_STATUS_UPDATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 