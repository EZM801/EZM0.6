import { NextResponse } from "next/server"
import prisma from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { v4 as uuidv4 } from 'uuid'

// Types
interface CreateMoveInput {
  name: string
  description?: string | null
  moveType?: "residential" | "commercial" | "storage" | "packing" | "unpacking" | null
  startDate?: string | null
  endDate?: string | null
  fromAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    hasElevator?: boolean
    floorNumber?: number | null
    specialInstructions?: string | null
  } | null
  toAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    hasElevator?: boolean
    floorNumber?: number | null
    specialInstructions?: string | null
  } | null
  stops?: Array<{
    name?: string
    street: string
    city: string
    state: string
    zipCode: string
    country?: string
    arrivalDate?: string | null
    departureDate?: string | null
    notes?: string | null
  }>
}

// Validation schema
const createMoveSchema = z.object({
  name: z.string().min(1, "Move name cannot be empty"),
  description: z.string().nullable().optional(),
  moveType: z.enum(["residential", "commercial", "storage", "packing", "unpacking"]).nullable().optional(),
  startDate: z.string().refine((str) => {
    if (!str) return true;
    const date = new Date(str);
    return !isNaN(date.getTime());
  }, "Invalid date format").nullable().optional(),
  endDate: z.string().refine((str) => {
    if (!str) return true;
    const date = new Date(str);
    return !isNaN(date.getTime());
  }, "Invalid date format").nullable().optional(),
  fromAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    hasElevator: z.boolean().optional(),
    floorNumber: z.number().nullable().optional(),
    specialInstructions: z.string().nullable().optional(),
  }).nullable().optional(),
  toAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    hasElevator: z.boolean().optional(),
    floorNumber: z.number().nullable().optional(),
    specialInstructions: z.string().nullable().optional(),
  }).nullable().optional(),
  stops: z.array(z.object({
    name: z.string().optional(),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().optional().default("US"),
    arrivalDate: z.string().nullable().optional(),
    departureDate: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })).optional(),
});

// Route handlers
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Please sign in to create a move' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createMoveSchema.parse(body)

    // Get user's company ID if they have one
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Your account information could not be found' } },
        { status: 404 }
      );
    }

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create addresses if provided
      let fromAddressId: string | undefined;
      if (validatedData.fromAddress) {
        const fromAddress = await tx.address.create({
          data: {
            id: uuidv4(), // Generate UUID for address
            street: validatedData.fromAddress.street,
            city: validatedData.fromAddress.city,
            state: validatedData.fromAddress.state,
            zipCode: validatedData.fromAddress.zipCode,
            hasElevator: validatedData.fromAddress.hasElevator || false,
            floorNumber: validatedData.fromAddress.floorNumber || null,
            specialInstructions: validatedData.fromAddress.specialInstructions || null,
          }
        });
        fromAddressId = fromAddress.id;
      }

      let toAddressId: string | undefined;
      if (validatedData.toAddress) {
        const toAddress = await tx.address.create({
          data: {
            id: uuidv4(), // Generate UUID for address
            street: validatedData.toAddress.street,
            city: validatedData.toAddress.city,
            state: validatedData.toAddress.state,
            zipCode: validatedData.toAddress.zipCode,
            hasElevator: validatedData.toAddress.hasElevator || false,
            floorNumber: validatedData.toAddress.floorNumber || null,
            specialInstructions: validatedData.toAddress.specialInstructions || null,
          }
        });
        toAddressId = toAddress.id;
      }

      // Create move
      const move = await tx.move.create({
        data: {
          id: uuidv4(), // Generate UUID for move
          name: validatedData.name,
          userId: session.user.id,
          description: validatedData.description || null,
          moveType: validatedData.moveType || "residential",
          startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
          endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
          status: "draft",
          visibility: "private",
          isTemplate: false,
          companyId: user.companyId || null,
          updatedAt: new Date(),
          fromAddressId,
          toAddressId,
          stops: validatedData.stops && validatedData.stops.length > 0 ? {
            create: validatedData.stops.map((stop, index) => ({
              id: uuidv4(), // Generate UUID for each stop
              name: stop.name || `Stop ${index + 1}`,
              address: stop.street,
              city: stop.city,
              state: stop.state,
              zipCode: stop.zipCode,
              country: stop.country || "US",
              notes: stop.notes || null,
              updatedAt: new Date()
            }))
          } : undefined
        },
        include: {
          fromAddress: true,
          toAddress: true,
          stops: {
            include: {
              addressDetails: true
            }
          },
        },
      });

      return move;
    });

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Move created successfully' 
    });
  } catch (error) {
    console.error("Error creating move:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: "Please check your input and try again", details: error.errors } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: "Unable to create move at this time. Please try again later." } },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Please sign in to view your moves' } },
        { status: 401 }
      )
    }

    const moves = await prisma.move.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        fromAddress: true,
        toAddress: true,
        stops: {
          include: {
            addressDetails: true
          }
        },
      },
      orderBy: {
        startDate: "desc",
      },
    })

    if (!moves || moves.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [], 
        message: 'No moves found. Create your first move to get started!' 
      })
    }

    return NextResponse.json({ success: true, data: moves })
  } catch (error) {
    console.error("Error fetching moves:", error)
    return NextResponse.json(
      { success: false, error: { message: 'Unable to fetch moves at this time. Please try again later.' } },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Please sign in to update moves' } },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { moveId, status } = body

    if (!moveId || !status) {
      return NextResponse.json(
        { success: false, error: { message: 'Move ID and status are required to update a move' } },
        { status: 400 }
      )
    }

    // Verify move access
    const move = await prisma.move.findFirst({
      where: {
        id: moveId,
        userId: session.user.id
      }
    })

    if (!move) {
      return NextResponse.json(
        { success: false, error: { message: 'Move not found or you do not have permission to update it' } },
        { status: 404 }
      )
    }

    // Update move status
    const updatedMove = await prisma.move.update({
      where: {
        id: moveId
      },
      data: {
        status
      },
      include: {
        fromAddress: true,
        toAddress: true,
        stops: {
          include: {
            addressDetails: true
          }
        },
        user: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: updatedMove,
      message: 'Move updated successfully' 
    })
  } catch (error) {
    console.error("[MOVES_PATCH]", error)
    return NextResponse.json(
      { success: false, error: { message: 'Unable to update move at this time. Please try again later.' } },
      { status: 500 }
    )
  }
}
