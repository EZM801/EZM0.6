import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { Prisma } from '@prisma/client'

// Validation schemas
const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(5),
  country: z.string().default('US'),
  hasElevator: z.boolean().default(false),
  floorNumber: z.number().optional(),
  specialInstructions: z.string().optional()
})

const createMoveSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  moveType: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'STORAGE', 'PACKING', 'UNPACKING']),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)).optional(),
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  clientPhone: z.string().min(10),
  estimatedBudget: z.number().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  fromAddress: addressSchema,
  toAddress: addressSchema,
  employeeIds: z.array(z.string()).optional(),
  vehicleIds: z.array(z.string()).optional(),
  specialInstructions: z.string().optional()
})

const filterSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional()
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    const userId = session?.userId
    const orgId = session?.orgId
    
    if (!userId || !orgId) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = createMoveSchema.parse(body)

    // Create the from address
    const fromAddress = await prisma.address.create({
      data: {
        street: validatedData.fromAddress.street,
        city: validatedData.fromAddress.city,
        state: validatedData.fromAddress.state,
        zipCode: validatedData.fromAddress.zipCode,
        hasElevator: validatedData.fromAddress.hasElevator,
        floorNumber: validatedData.fromAddress.floorNumber,
        specialInstructions: validatedData.fromAddress.specialInstructions
      }
    })

    // Create the to address
    const toAddress = await prisma.address.create({
      data: {
        street: validatedData.toAddress.street,
        city: validatedData.toAddress.city,
        state: validatedData.toAddress.state,
        zipCode: validatedData.toAddress.zipCode,
        hasElevator: validatedData.toAddress.hasElevator,
        floorNumber: validatedData.toAddress.floorNumber,
        specialInstructions: validatedData.toAddress.specialInstructions
      }
    })

    // Create the move
    const move = await prisma.move.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        moveType: validatedData.moveType,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        status: 'PENDING',
        userId,
        companyId: orgId,
        fromAddressId: fromAddress.id,
        toAddressId: toAddress.id,
        visibility: 'PRIVATE'
      }
    })

    // If employee IDs were provided, create the assignments
    if (validatedData.employeeIds?.length) {
      await prisma.moveCollaborator.createMany({
        data: validatedData.employeeIds.map(employeeId => ({
          moveId: move.id,
          userId: employeeId,
          role: 'employee'
        }))
      })
    }

    // If vehicle IDs were provided, create the assignments
    if (validatedData.vehicleIds?.length) {
      await prisma.moveVehicle.createMany({
        data: validatedData.vehicleIds.map(vehicleId => ({
          moveId: move.id,
          vehicleId,
        }))
      })
    }

    return NextResponse.json({ success: true, data: move })
  } catch (error) {
    console.error('Error creating move:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid input data', details: error.errors } },
        { status: 400 }
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { success: false, error: { message: 'Database error', code: error.code } },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    const userId = session?.userId
    const orgId = session?.orgId
    
    if (!userId || !orgId) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const filters = {
      status: searchParams.get('status'),
      priority: searchParams.get('priority'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate')
    }

    const validatedFilters = filterSchema.parse(filters)

    const where = {
      companyId: orgId,
      ...(validatedFilters.status && { status: validatedFilters.status }),
      ...(validatedFilters.priority && { priority: validatedFilters.priority }),
      ...(validatedFilters.startDate && { 
        startDate: { 
          gte: validatedFilters.startDate 
        } 
      }),
      ...(validatedFilters.endDate && { 
        endDate: { 
          lte: validatedFilters.endDate 
        } 
      })
    }

    const moves = await prisma.move.findMany({
      where,
      include: {
        fromAddress: true,
        toAddress: true,
        collaborators: {
          include: {
            user: true
          }
        },
        vehicles: true
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: moves 
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: 'Validation error', 
            code: 'VALIDATION_ERROR',
            details: error.errors 
          } 
        },
        { status: 400 }
      )
    }

    console.error('Error fetching company moves:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Internal server error', 
          code: 'INTERNAL_SERVER_ERROR' 
        } 
      },
      { status: 500 }
    )
  }
} 