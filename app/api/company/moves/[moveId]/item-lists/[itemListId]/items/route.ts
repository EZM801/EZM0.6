import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const itemSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  weight: z.number().optional(),
  value: z.number().optional(),
  isFragile: z.boolean().default(false),
  specialInstructions: z.string().optional(),
  packingStatus: z.enum(['UNPACKED', 'PACKED', 'LOADED', 'UNLOADED', 'UNPACKED_AT_DESTINATION']).default('UNPACKED'),
  originRoomId: z.string().optional(),
  destinationRoomId: z.string().optional(),
  stopRoomId: z.string().optional(),
  qrCode: z.string().optional(),
  image: z.object({
    url: z.string().optional(),
    description: z.string().optional(),
    mimeType: z.string().optional(),
    size: z.number().optional(),
    isPrimary: z.boolean().optional()
  }).optional().nullable()
});

export async function GET(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.userType !== "COMPANY") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Verify the move belongs to the company
    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId || undefined,
      },
      include: {
        itemLists: {
          where: {
            id: params.itemListId
          }
        }
      }
    });

    if (!move) {
      return new NextResponse("Move not found", { status: 404 });
    }

    if (!move.itemLists.length) {
      return new NextResponse("Item list not found", { status: 404 });
    }

    // Fetch items
    const items = await prisma.companyItem.findMany({
      where: {
        itemListId: params.itemListId
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the response to match frontend expectations
    const response = items.map(item => ({
      ...item,
      image: item.photos?.[0] ? {
        url: item.photos[0].url,
        description: item.photos[0].description,
        mimeType: item.photos[0].mimeType,
        size: item.photos[0].size,
        isPrimary: item.photos[0].isPrimary,
      } : null
    }));

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Error fetching items:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.userType !== "COMPANY") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Verify the move belongs to the company
    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId || undefined,
      },
      include: {
        itemLists: {
          where: {
            id: params.itemListId
          }
        }
      }
    });

    if (!move) {
      return new NextResponse("Move not found", { status: 404 });
    }

    if (!move.itemLists.length) {
      return new NextResponse("Item list not found", { status: 404 });
    }

    const json = await request.json();
    const body = itemSchema.parse(json);

    // Create the item and photo in a transaction
    const result = await prisma.$transaction(async (tx) => {
    // Create the item
      const item = await tx.companyItem.create({
      data: {
        name: body.name,
        description: body.description || "",
        weight: body.weight,
        value: body.value,
        isFragile: body.isFragile,
        specialInstructions: body.specialInstructions || "",
        packingStatus: body.packingStatus,
        originRoomId: body.originRoomId,
        destinationRoomId: body.destinationRoomId,
        stopRoomId: body.stopRoomId,
        qrCode: body.qrCode,
        itemListId: params.itemListId,
      }
      });

      // If an image was provided, create the photo record
      if (body.image?.url) {
        await tx.companyItemPhoto.create({
          data: {
            url: body.image.url,
            description: body.image.description || null,
            mimeType: body.image.mimeType || 'image/jpeg',
            size: body.image.size || 0,
            isPrimary: true,
            itemId: item.id,
          }
        });
      }

      // Fetch the complete item with its photos
      const itemWithPhotos = await tx.companyItem.findUnique({
        where: { id: item.id },
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
    console.error("Error creating item:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
} 