import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { authOptions } from "@/app/lib/auth"
import { v4 as uuidv4 } from 'uuid'

const equipmentSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  description: z.string().optional(),
  isAvailable: z.boolean().default(true),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.companyId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const equipment = await prisma.equipment.findMany({
      where: {
        companyId: session.user.companyId,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({
      success: true,
      data: equipment
    })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.companyId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = equipmentSchema.parse(json)

    const equipment = await prisma.equipment.create({
      data: {
        id: uuidv4(),
        name: body.name,
        type: body.type,
        description: body.description || undefined,
        isAvailable: body.isAvailable,
        companyId: session.user.companyId
      },
    })

    return NextResponse.json({
      success: true,
      data: equipment
    })
  } catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 