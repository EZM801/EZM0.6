import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { CreateMoveStopInput } from '@/app/types/MoveStopType';

// GET /api/move-stops - Get all move stops for a move
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const moveId = searchParams.get('moveId');

    if (!moveId) {
      return NextResponse.json(
        { error: 'Move ID is required' },
        { status: 400 }
      );
    }

    // Verify move belongs to user
    const move = await prisma.move.findFirst({
      where: {
        id: moveId,
        user: {
          email: session.user.email
        }
      }
    });

    if (!move) {
      return NextResponse.json(
        { error: 'Move not found or access denied' },
        { status: 404 }
      );
    }

    const moveStops = await prisma.moveStop.findMany({
      where: {
        moveId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(moveStops);
  } catch (error) {
    console.error('Error fetching move stops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch move stops' },
      { status: 500 }
    );
  }
}

// POST /api/move-stops - Create a new move stop
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateMoveStopInput = await request.json();

    // Verify move belongs to user
    const move = await prisma.move.findFirst({
      where: {
        id: body.moveId,
        user: {
          email: session.user.email
        }
      }
    });

    if (!move) {
      return NextResponse.json(
        { error: 'Move not found or access denied' },
        { status: 404 }
      );
    }

    const moveStop = await prisma.moveStop.create({
      data: {
        moveId: body.moveId,
        name: body.name,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        country: body.country,
        arrivalDate: body.arrivalDate,
        departureDate: body.departureDate,
        notes: body.notes,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(moveStop, { status: 201 });
  } catch (error) {
    console.error('Error creating move stop:', error);
    return NextResponse.json(
      { error: 'Failed to create move stop' },
      { status: 500 }
    );
  }
} 