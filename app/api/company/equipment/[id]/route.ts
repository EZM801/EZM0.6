import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const equipmentSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  serialNumber: z.string().optional(),
  isActive: z.boolean().default(true),
})

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = equipmentSchema.parse(json)

    const equipment = await prisma.equipment.update({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      data: {
        name: body.name,
        type: body.type,
        serialNumber: body.serialNumber || undefined,
        isActive: body.isActive,
      },
    })

    return NextResponse.json(equipment)
  } catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 