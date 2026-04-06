import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { z } from 'zod';

const updateItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  category: z.string().optional(),
  type: z.string().optional(),
  weight: z.number().optional().nullable(),
  isFragile: z.boolean().optional(),
  specialInstructions: z.string().optional().nullable(),
  packingStatus: z.enum(["unpacked", "packed", "in_transit", "unpacked_at_destination"]).optional(),
  originRoomId: z.string().optional().nullable(),
  destinationRoomId: z.string().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { moveId, itemListId, itemId } = params;
    if (!moveId || !itemListId || !itemId) {
      return NextResponse.json(
        { success: false, error: { message: 'Move ID, Item List ID, and Item ID are required' } },
        { status: 400 }
      );
    }

    // Verify move access
    const move = await prisma.move.findFirst({
      where: {
        id: moveId,
        OR: [
          { userId: session.user.id },
          { company: { users: { some: { id: session.user.id } } } }
        ]
      }
    });

    if (!move) {
      return NextResponse.json(
        { success: false, error: { message: 'Move not found or access denied' } },
        { status: 404 }
      );
    }

    const item = await prisma.item.findUnique({
      where: {
        id: itemId,
        itemList: {
          id: itemListId,
          moveId: moveId,
        },
      },
      include: {
        originRoom: {
          select: {
            id: true,
            name: true
          }
        },
        destinationRoom: {
          select: {
            id: true,
            name: true
          }
        },
        photos: {
          where: {
            isPrimary: true
          },
          take: 1
        },
        qrCodes: {
          take: 1
        }
      }
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: { message: 'Item not found' } },
        { status: 404 }
      );
    }

    // Transform the response to match frontend expectations
    const response = {
      ...item,
      image: item.photos[0] ? {
        url: item.photos[0].url,
        description: item.photos[0].description,
        mimeType: item.photos[0].mimeType,
        size: item.photos[0].size,
        isPrimary: item.photos[0].isPrimary,
      } : null,
      qrCode: item.qrCodes[0]?.code || null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch item' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { moveId, itemListId, itemId } = params;
    if (!moveId || !itemListId || !itemId) {
      return NextResponse.json(
        { success: false, error: { message: 'Move ID, Item List ID, and Item ID are required' } },
        { status: 400 }
      );
    }

    // Verify move access
    const move = await prisma.move.findFirst({
      where: {
        id: moveId,
        OR: [
          { userId: session.user.id },
          { company: { users: { some: { id: session.user.id } } } }
        ]
      }
    });

    if (!move) {
      return NextResponse.json(
        { success: false, error: { message: 'Move not found or access denied' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateItemSchema.parse(body);

    const updatedItem = await prisma.item.update({
      where: {
        id: itemId,
        itemList: {
          id: itemListId,
          moveId: moveId,
        },
      },
      data: validatedData,
      include: {
        originRoom: {
          select: {
            id: true,
            name: true
          }
        },
        destinationRoom: {
          select: {
            id: true,
            name: true
          }
        }
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        ...updatedItem,
        createdAt: updatedItem.createdAt.toISOString(),
        updatedAt: updatedItem.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating item:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: 'Failed to update item' } },
      { status: 500 }
    );
  }
} 