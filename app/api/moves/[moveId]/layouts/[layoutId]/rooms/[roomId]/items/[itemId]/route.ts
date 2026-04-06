import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { UpdateItemRequest } from '@/app/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

interface RouteParams {
  params: {
    moveId: string;
    layoutId: string;
    roomId: string;
    itemId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const item = await prisma.item.findFirst({
      where: {
        id: params.itemId,
        roomId: params.roomId,
        room: {
          layoutId: params.layoutId,
          layout: {
            moveId: params.moveId,
            move: {
              userId: session.user.id,
            },
          },
        },
      },
      include: {
        qrCode: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: UpdateItemRequest = await request.json();
    
    // Verify item belongs to user's move
    const item = await prisma.item.findFirst({
      where: {
        id: params.itemId,
        roomId: params.roomId,
        room: {
          layoutId: params.layoutId,
          layout: {
            moveId: params.moveId,
            move: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const updatedItem = await prisma.item.update({
      where: {
        id: params.itemId,
      },
      data,
      include: {
        qrCode: true,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify item belongs to user's move
    const item = await prisma.item.findFirst({
      where: {
        id: params.itemId,
        roomId: params.roomId,
        room: {
          layoutId: params.layoutId,
          layout: {
            moveId: params.moveId,
            move: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await prisma.item.delete({
      where: {
        id: params.itemId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
} 