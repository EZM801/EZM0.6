import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { UpdateMoveStopInput } from '@/app/types/MoveStopType';

// GET /api/move-stops/[moveStopId] - Get a specific move stop
export async function GET(
  request: Request,
  { params }: { params: { moveStopId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const moveStop = await prisma.moveStop.findFirst({
      where: {
        id: params.moveStopId,
        move: {
          userId: session.user.id,
        },
      },
      include: {
        addressDetails: true,
      },
    });

    if (!moveStop) {
      return new NextResponse('Move stop not found', { status: 404 });
    }

    return NextResponse.json(moveStop);
  } catch (error) {
    console.error('[MOVE_STOP_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT /api/move-stops/[moveStopId] - Update a move stop
export async function PUT(
  request: Request,
  { params }: { params: { moveStopId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await request.json();
    const { addressId, arrivalDate, departureDate } = json;

    const moveStop = await prisma.moveStop.update({
      where: {
        id: params.moveStopId,
        move: {
          userId: session.user.id,
        },
      },
      data: {
        addressId,
        arrivalDate,
        departureDate,
      },
      include: {
        addressDetails: true,
      },
    });

    return NextResponse.json(moveStop);
  } catch (error) {
    console.error('[MOVE_STOP_PUT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/move-stops/[moveStopId] - Delete a move stop
export async function DELETE(
  request: Request,
  { params }: { params: { moveStopId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.moveStop.delete({
      where: {
        id: params.moveStopId,
        move: {
          userId: session.user.id,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[MOVE_STOP_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/move-stops/[moveStopId] - Create a route for a move stop
export async function POST(
  request: Request,
  { params }: { params: { moveStopId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await request.json();
    // Add your route creation logic here

    return new NextResponse(null, { status: 201 });
  } catch (error) {
    console.error('[MOVE_STOP_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 