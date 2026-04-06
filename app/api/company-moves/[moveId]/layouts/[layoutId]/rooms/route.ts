import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const roomSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { moveId: string; layoutId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const body = roomSchema.parse(json);

    // Verify move belongs to user's company
    const move = await prisma.companyMove.findUnique({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      },
      include: {
        layouts: {
          where: {
            id: params.layoutId
          }
        }
      }
    });

    if (!move) {
      return NextResponse.json({ error: 'Move not found' }, { status: 404 });
    }

    if (!move.layouts.length) {
      return NextResponse.json({ error: 'Layout not found' }, { status: 404 });
    }

    const room = await prisma.companyRoom.create({
      data: {
        ...body,
        layoutId: params.layoutId,
      }
    });

    return NextResponse.json({ success: true, data: room });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { moveId: string; layoutId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify move belongs to user's company
    const move = await prisma.companyMove.findUnique({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      }
    });

    if (!move) {
      return NextResponse.json({ error: 'Move not found' }, { status: 404 });
    }

    const rooms = await prisma.companyRoom.findMany({
      where: {
        layoutId: params.layoutId,
        layout: {
          moveId: params.moveId
        }
      }
    });

    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string; layoutId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    // Verify move belongs to user's company
    const move = await prisma.companyMove.findUnique({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      }
    });

    if (!move) {
      return NextResponse.json({ error: 'Move not found' }, { status: 404 });
    }

    // Verify room belongs to the specified layout and move
    const existingRoom = await prisma.companyRoom.findFirst({
      where: {
        id: roomId,
        layoutId: params.layoutId,
        layout: {
          moveId: params.moveId
        }
      }
    });

    if (!existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    await prisma.companyRoom.delete({
      where: { id: roomId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 