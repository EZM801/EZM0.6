import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const updateItemSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional().nullable(),
  weight: z.number().optional().nullable(),
  value: z.number().optional().nullable(),
  isFragile: z.boolean().optional().nullable(),
  specialInstructions: z.string().optional().nullable(),
  packingStatus: z.enum(['UNPACKED', 'PACKED', 'LOADED', 'UNLOADED', 'UNPACKED_AT_DESTINATION']).optional().nullable(),
  originRoomId: z.string().optional().nullable(),
  destinationRoomId: z.string().optional().nullable(),
  stopRoomId: z.string().optional().nullable(),
  qrCode: z.string().optional().nullable(),
  image: z.object({
    url: z.string(),
    description: z.string().optional().nullable(),
    mimeType: z.string().optional().nullable(),
    size: z.number().optional().nullable(),
    isPrimary: z.boolean().optional().nullable()
  }).optional().nullable()
});

export async function GET(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify move belongs to user's organization
    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      }
    });

    if (!move) {
      return NextResponse.json({ error: 'Move not found' }, { status: 404 });
    }

    const item = await prisma.companyItem.findFirst({
      where: {
        id: params.itemId,
        itemListId: params.itemListId,
        itemList: {
          moveId: params.moveId
        }
      },
      include: {
        originRoom: true,
        destinationRoom: true,
        stopRoom: true,
        itemList: true,
        photos: {
          where: {
            isPrimary: true
          },
          take: 1
        }
      }
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Transform the response to match frontend expectations
    const response = {
      ...item,
      image: item.photos?.[0] ? {
        url: item.photos[0].url,
        description: item.photos[0].description,
        mimeType: item.photos[0].mimeType,
        size: item.photos[0].size,
        isPrimary: item.photos[0].isPrimary,
      } : null
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const body = updateItemSchema.parse(json);

    // Clean up null values and handle image separately
    const { image, ...rest } = body;
    const updateData = Object.fromEntries(
      Object.entries(rest).filter(([_, value]) => value !== null)
    );

    // Verify move belongs to user's organization
    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      }
    });

    if (!move) {
      return NextResponse.json({ error: 'Move not found' }, { status: 404 });
    }

    // Verify item belongs to the specified list and move
    const existingItem = await prisma.companyItem.findFirst({
      where: {
        id: params.itemId,
        itemListId: params.itemListId,
        itemList: {
          moveId: params.moveId
        }
      }
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Update the item and handle image in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the item
      const item = await tx.companyItem.update({
        where: { id: params.itemId },
        data: updateData
      });

      // If an image was provided, update or create the photo record
      if (image?.url) {
        // Delete existing photos if any
        await tx.companyItemPhoto.deleteMany({
          where: {
            itemId: params.itemId,
          }
        });

        // Create new photo record
        await tx.companyItemPhoto.create({
          data: {
            url: image.url,
            description: image.description || null,
            mimeType: image.mimeType || 'image/jpeg',
            size: image.size || 0,
            isPrimary: true,
            itemId: params.itemId,
          }
        });
      }

      // Fetch the complete item with its photos
      const itemWithPhotos = await tx.companyItem.findUnique({
        where: { id: params.itemId },
        include: {
          photos: {
            where: {
              isPrimary: true
            },
            take: 1
          }
        }
      });

      return itemWithPhotos;
    });

    // Transform the response to match frontend expectations
    const response = {
      ...result,
      image: result?.photos?.[0] ? {
        url: result.photos[0].url,
        description: result.photos[0].description,
        mimeType: result.photos[0].mimeType,
        size: result.photos[0].size,
        isPrimary: result.photos[0].isPrimary,
      } : null
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Error updating item:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify move belongs to user's organization
    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      }
    });

    if (!move) {
      return NextResponse.json({ error: 'Move not found' }, { status: 404 });
    }

    // Verify item belongs to the specified list and move
    const existingItem = await prisma.companyItem.findFirst({
      where: {
        id: params.itemId,
        itemListId: params.itemListId,
        itemList: {
          moveId: params.moveId
        }
      }
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await prisma.companyItem.delete({
      where: { id: params.itemId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 