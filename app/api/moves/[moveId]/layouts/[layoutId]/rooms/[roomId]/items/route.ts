import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { CreateItemRequest } from '@/app/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { generateQRCode } from '@/app/lib/qrcode';

interface RouteParams {
  params: {
    moveId: string;
    layoutId: string;
    roomId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await prisma.item.findMany({
      where: {
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

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: CreateItemRequest = await request.json();
    
    // Verify room belongs to user's move
    const room = await prisma.room.findFirst({
      where: {
        id: params.roomId,
        layoutId: params.layoutId,
        layout: {
          moveId: params.moveId,
          move: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Generate QR code for the item
    const qrCodeData = {
      itemId: '', // Will be updated after item creation
      moveId: params.moveId,
      roomId: params.roomId,
      layoutId: params.layoutId,
    };

    const qrCode = await generateQRCode(JSON.stringify(qrCodeData));

    // Create item with QR code
    const item = await prisma.item.create({
      data: {
        ...data,
        roomId: params.roomId,
        moveId: params.moveId,
        qrCode: {
          create: {
            code: qrCode,
            data: qrCodeData,
          },
        },
      },
      include: {
        qrCode: true,
      },
    });

    // Update QR code data with the actual item ID
    await prisma.qRCode.update({
      where: {
        id: item.qrCode.id,
      },
      data: {
        data: {
          ...qrCodeData,
          itemId: item.id,
        },
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
} 