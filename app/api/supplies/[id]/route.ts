import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import { z } from "zod"

const updateSupplySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  quantityInStock: z.number().min(0, "Quantity must be 0 or greater"),
  reorderPoint: z.number().min(0, "Reorder point must be 0 or greater").default(10),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const supply = await prisma.supply.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!supply) {
      return NextResponse.json(
        { error: "Supply not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(supply)
  } catch (error) {
    console.error("[SUPPLY_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateSupplySchema.parse(body)

    const supply = await prisma.supply.update({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      data: validatedData,
    })

    return NextResponse.json(supply)
  } catch (error) {
    console.error("[SUPPLY_PATCH]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const supply = await prisma.supply.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!supply) {
      return NextResponse.json(
        { error: "Supply not found" },
        { status: 404 }
      )
    }

    await prisma.supply.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SUPPLY_DELETE]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 