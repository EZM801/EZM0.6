import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { CreateMoveStopInput } from '@/app/types/MoveStopType';

// GET /api/moves/[moveId]/stops - Get all stops for a specific move
export async function GET(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Please sign in to view move stops' } },
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
        { success: false, error: { message: 'Move not found or you do not have permission to view it' } },
        { status: 404 }
      );
    }

    const stops = await prisma.moveStop.findMany({
      where: {
        moveId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ success: true, data: stops });
  } catch (error) {
    console.error('Error fetching move stops:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Unable to fetch move stops at this time. Please try again later.' } },
      { status: 500 }
    );
  }
}

// POST /api/moves/[moveId]/stops - Create a new stop for a specific move
export async function POST(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Please sign in to create a move stop' } },
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

    const body: CreateMoveStopInput = await request.json();

    // Verify move belongs to user
    const move = await prisma.move.findFirst({
      where: {
        id: moveId,
        userId: session.user.id,
      },
    });

    if (!move) {
      return NextResponse.json(
        { success: false, error: { message: 'Move not found or you do not have permission to update it' } },
        { status: 404 }
      );
    }

    // First create the address if addressDetails is provided
    let addressId = null;
    if (body.addressDetails) {
      const address = await prisma.address.create({
        data: {
          street: body.addressDetails.street,
          city: body.addressDetails.city,
          state: body.addressDetails.state,
          zipCode: body.addressDetails.zipCode,
          hasElevator: body.addressDetails.hasElevator ?? false,
          floorNumber: body.addressDetails.floorNumber ?? null,
          specialInstructions: body.addressDetails.specialInstructions ?? null,
        }
      });
      addressId = address.id;
    }

    // Then create the move stop with the address ID if it exists
    const moveStop = await prisma.moveStop.create({
      data: {
        moveId,
        name: body.name,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        country: body.country,
        arrivalDate: body.arrivalDate,
        departureDate: body.departureDate,
        notes: body.notes,
        updatedAt: new Date(),
        ...(addressId ? { addressDetailsId: addressId } : {})
      },
      include: {
        addressDetails: true
      }
    });

    return NextResponse.json({ success: true, data: moveStop }, { status: 201 });
  } catch (error) {
    console.error('Error creating move stop:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Unable to create move stop at this time. Please try again later.' } },
      { status: 500 }
    );
  }
} 