import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { authOptions } from "@/app/lib/auth"
import { v4 as uuidv4 } from 'uuid'

const vehicleSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Unauthorized"
        }),
        { status: 401 }
      )
    }

    // Get the user with their company info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company?.id) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "No company associated with user"
        }),
        { status: 400 }
      )
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        companyId: user.company.id,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({
      success: true,
      data: vehicles
    })
  } catch (error) {
    console.error(error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Internal Server Error",
      }),
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Unauthorized",
        }),
        { status: 401 }
      )
    }

    // Get the user with their company info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company?.id) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "No company associated with user"
        }),
        { status: 400 }
      )
    }

    const json = await req.json()
    const body = vehicleSchema.parse(json)

    // Debug logging
    console.log("[VEHICLE_CREATE] Company ID:", user.company.id)

    try {
      const vehicle = await prisma.vehicle.create({
        data: {
          id: uuidv4(), // Generate a new UUID for the vehicle
          name: body.name,
          companyId: user.company.id,
          type: "standard",
          licensePlate: "",
          capacity: 0,
          isAvailable: true,
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        data: vehicle,
      })
    } catch (error) {
      console.error("[VEHICLE_CREATE] Detailed error:", error)
      throw error
    }
  } catch (error) {
    console.error("[VEHICLE_CREATE] Outer error:", error)
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Invalid request data",
          details: error.errors,
        }),
        { status: 400 }
      )
    }
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Internal Server Error",
      }),
      { status: 500 }
    )
  }
} 