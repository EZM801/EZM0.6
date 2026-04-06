import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const vehicleSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  licensePlate: z.string().optional(),
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
    const body = vehicleSchema.parse(json)

    const vehicle = await prisma.vehicle.update({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      data: {
        name: body.name,
        type: body.type,
        licensePlate: body.licensePlate || undefined,
        isActive: body.isActive,
      },
    })

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.vehicle.delete({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 