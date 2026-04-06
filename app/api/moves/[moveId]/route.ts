import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  hasElevator: z.boolean().optional(),
  floorNumber: z.number().nullable().optional(),
  specialInstructions: z.string().nullable().optional(),
});

const stopSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
  arrivalDate: z.string().nullable().optional(),
  departureDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const updateMoveSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  moveType: z.enum(['residential', 'commercial', 'storage', 'packing', 'unpacking']),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  fromAddress: addressSchema.nullable().optional(),
  toAddress: addressSchema.nullable().optional(),
  stops: z.array(stopSchema).default([]),
});

export async function GET(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const moveId = params.moveId;
    if (!moveId) {
      return NextResponse.json(
        { success: false, error: { message: 'Move ID is required' } },
        { status: 400 }
      );
    }

    const move = await prisma.move.findUnique({
      where: {
        id: moveId,
        userId: session.user.id,
      },
      include: {
        fromAddress: true,
        toAddress: true,
        layouts: true,
        stops: {
          include: {
            addressDetails: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
      },
    });

    if (!move) {
      return NextResponse.json({ error: 'Move not found' }, { status: 404 });
    }

    // Log the move data for debugging
    console.log('Move data:', JSON.stringify(move, null, 2));

    return NextResponse.json(move);
  } catch (error) {
    console.error('Error fetching move:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Please sign in to update move details' } },
        { status: 401 }
      );
    }

    const { moveId } = params;
    if (!moveId) {
      return NextResponse.json(
        { success: false, error: { message: 'Move ID is required' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateMoveSchema.parse(body);

    // Verify move belongs to user
    const existingMove = await prisma.move.findFirst({
      where: {
        id: moveId,
        userId: session.user.id,
      },
    });

    if (!existingMove) {
      return NextResponse.json(
        { success: false, error: { message: 'Move not found or you do not have permission to update it' } },
        { status: 404 }
      );
    }

    // Use a transaction to ensure all updates are atomic
    const result = await prisma.$transaction(async (tx) => {
      // Update or create from address
      let fromAddressId = null;
      if (validatedData.fromAddress) {
        if (existingMove.fromAddressId) {
          // Update existing address
          const fromAddress = await tx.address.update({
            where: { id: existingMove.fromAddressId },
            data: validatedData.fromAddress,
          });
          fromAddressId = fromAddress.id;
        } else {
          // Create new address
          const fromAddress = await tx.address.create({
            data: validatedData.fromAddress,
          });
          fromAddressId = fromAddress.id;
        }
      }

      // Update or create to address
      let toAddressId = null;
      if (validatedData.toAddress) {
        if (existingMove.toAddressId) {
          // Update existing address
          const toAddress = await tx.address.update({
            where: { id: existingMove.toAddressId },
            data: validatedData.toAddress,
          });
          toAddressId = toAddress.id;
        } else {
          // Create new address
          const toAddress = await tx.address.create({
            data: validatedData.toAddress,
          });
          toAddressId = toAddress.id;
        }
      }

      // Update the move
      const move = await tx.move.update({
        where: { id: moveId },
        data: {
          name: validatedData.name,
          description: validatedData.description,
          moveType: validatedData.moveType.toUpperCase(),
          startDate: new Date(validatedData.startDate),
          endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
          fromAddressId,
          toAddressId,
          updatedAt: new Date(),
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

      // Handle stops
      if (validatedData.stops.length > 0) {
        // Delete existing stops
        await tx.moveStop.deleteMany({
          where: { moveId },
        });

        // Create new stops
        for (const stop of validatedData.stops) {
          await tx.moveStop.create({
            data: {
              moveId,
              name: stop.name,
              address: stop.address,
              city: stop.city,
              state: stop.state,
              zipCode: stop.zipCode,
              country: stop.country,
              arrivalDate: stop.arrivalDate ? new Date(stop.arrivalDate) : null,
              departureDate: stop.departureDate ? new Date(stop.departureDate) : null,
              notes: stop.notes,
              updatedAt: new Date(),
            },
          });
        }
      }

      return move;
    });

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Move updated successfully' 
    });
  } catch (error) {
    console.error('Error updating move:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Please check your input and try again', details: error.errors } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: 'Unable to update move at this time. Please try again later.' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const moveId = params.moveId;
    if (!moveId) {
      return NextResponse.json(
        { success: false, error: { message: 'Move ID is required' } },
        { status: 400 }
      );
    }

    // Verify move belongs to user
    const move = await prisma.move.findFirst({
      where: {
        id: moveId,
        userId: session.user.id,
      },
    });

    if (!move) {
      return NextResponse.json(
        { success: false, error: { message: 'Move not found' } },
        { status: 404 }
      );
    }

    // Delete the move and all related data
    await prisma.move.delete({
      where: {
        id: moveId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting move:", error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to delete move' } },
      { status: 500 }
    );
  }
} 