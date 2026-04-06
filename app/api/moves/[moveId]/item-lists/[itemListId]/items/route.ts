import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { z } from 'zod';

// Define route params type
type RouteParams = {
  params: {
    moveId: string;
    itemListId: string;
  };
};

const itemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  weight: z.number().nullable(),
  isFragile: z.boolean().default(false),
  specialInstructions: z.string().optional().nullable(),
  qrCode: z.string().min(1, 'QR Code is required'),
  originRoomId: z.string().optional().nullable(),
  destinationRoomId: z.string().optional().nullable(),
  category: z.string().default('general'),
  image: z.object({
    url: z.string(),
    description: z.string().nullable(),
    mimeType: z.string(),
    size: z.number(),
    isPrimary: z.boolean()
  }).optional().nullable()
});

export async function GET(
  req: Request,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // Verify the item list exists and belongs to the move
    const itemList = await prisma.itemList.findFirst({
      where: {
        id: params.itemListId,
        moveId: params.moveId,
        move: {
          OR: [
            { userId: session.user.id },
            { company: { users: { some: { id: session.user.id } } } }
          ]
        }
      }
    });

    if (!itemList) {
      return NextResponse.json(
        { success: false, error: { message: 'Item list not found' } },
        { status: 404 }
      );
    }

    // Fetch items with their rooms, photos, and QR codes
    const items = await prisma.item.findMany({
      where: {
        itemListId: params.itemListId
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

    return NextResponse.json({
      success: true,
      data: items.map(item => ({
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
      }))
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal Server Error' } },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = itemSchema.parse(body);

    // Check if QR code is already in use
    const existingItem = await prisma.item.findFirst({
      where: {
        qrCode: validatedData.qrCode,
        itemList: {
          move: {
            OR: [
              { userId: session.user.id },
              { company: { users: { some: { id: session.user.id } } } }
            ]
          }
        }
      }
    });

    if (existingItem) {
      return NextResponse.json(
        { success: false, error: { message: 'This QR code is already in use' } },
        { status: 400 }
      );
    }

    // Verify the item list exists and belongs to the move
    const itemList = await prisma.itemList.findFirst({
      where: {
        id: params.itemListId,
        moveId: params.moveId,
        move: {
          OR: [
            { userId: session.user.id },
            { company: { users: { some: { id: session.user.id } } } }
          ]
        }
      }
    });

    if (!itemList) {
      return NextResponse.json(
        { success: false, error: { message: 'Item list not found' } },
        { status: 404 }
      );
    }

    // Create the item
    const item = await prisma.item.create({
      data: {
        ...validatedData,
        itemListId: params.itemListId
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
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating item:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: 'Internal Server Error' } },
      { status: 500 }
    );
  }
} 