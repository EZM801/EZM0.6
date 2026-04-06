import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { UpdateMoveStopInput } from '@/app/types/MoveStopType';

// GET /api/moves/[moveId]/stops/[stopId] - Get a specific stop
export async function GET(
  request: Request,
  { params }: { params: { moveId: string; stopId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Please sign in to view move stop' } },
        { status: 401 }
      );
    }

    const { moveId, stopId } = params;
    if (!moveId || !stopId) {
      return NextResponse.json(
        { success: false, error: { message: 'Move ID and Stop ID are required' } },
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

    const stop = await prisma.moveStop.findUnique({
      where: {
        id: stopId,
        moveId,
      },
    });

    if (!stop) {
      return NextResponse.json(
        { success: false, error: { message: 'Stop not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: stop });
  } catch (error) {
    console.error('Error fetching move stop:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Unable to fetch move stop at this time. Please try again later.' } },
      { status: 500 }
    );
  }
}

// PUT /api/moves/[moveId]/stops/[stopId] - Update a specific stop
export async function PUT(
  request: Request,
  { params }: { params: { moveId: string; stopId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Please sign in to update move stop' } },
        { status: 401 }
      );
    }

    const { moveId, stopId } = params;
    if (!moveId || !stopId) {
      return NextResponse.json(
        { success: false, error: { message: 'Move ID and Stop ID are required' } },
        { status: 400 }
      );
    }

    const body: UpdateMoveStopInput = await request.json();

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

    const moveStop = await prisma.moveStop.update({
      where: { id: stopId },
      data: {
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
        // If addressDetails is provided, update or create the Address record
        ...(body.addressDetails && {
          addressDetails: {
            upsert: {
              create: {
                street: body.addressDetails.street,
                city: body.addressDetails.city,
                state: body.addressDetails.state,
                zipCode: body.addressDetails.zipCode,
                hasElevator: body.addressDetails.hasElevator,
                floorNumber: body.addressDetails.floorNumber,
                specialInstructions: body.addressDetails.specialInstructions,
              },
              update: {
                street: body.addressDetails.street,
                city: body.addressDetails.city,
                state: body.addressDetails.state,
                zipCode: body.addressDetails.zipCode,
                hasElevator: body.addressDetails.hasElevator,
                floorNumber: body.addressDetails.floorNumber,
                specialInstructions: body.addressDetails.specialInstructions,
              }
            }
          }
        })
      },
      include: {
        addressDetails: true
      }
    });

    return NextResponse.json({ success: true, data: moveStop });
  } catch (error) {
    console.error('Error updating move stop:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Unable to update move stop at this time. Please try again later.' } },
      { status: 500 }
    );
  }
}

// DELETE /api/moves/[moveId]/stops/[stopId] - Delete a specific stop
export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string; stopId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Please sign in to delete move stop' } },
        { status: 401 }
      );
    }

    const { moveId, stopId } = params;
    if (!moveId || !stopId) {
      return NextResponse.json(
        { success: false, error: { message: 'Move ID and Stop ID are required' } },
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
        { success: false, error: { message: 'Move not found or you do not have permission to update it' } },
        { status: 404 }
      );
    }

    await prisma.moveStop.delete({
      where: {
        id: stopId,
        moveId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting move stop:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Unable to delete move stop at this time. Please try again later.' } },
      { status: 500 }
    );
  }
} 