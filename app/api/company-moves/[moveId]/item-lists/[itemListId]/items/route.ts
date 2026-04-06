import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const itemSchema = z.object({
  name: z.string().min(2),
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
});

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

    const item = await prisma.companyItem.create({
      data: {
        id: uuidv4(),
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

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error creating item:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify move belongs to user's organization
    const move = await prisma.companyMove.findUnique({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      }
    });

    if (!move) {
      return NextResponse.json({ error: 'Move not found' }, { status: 404 });
    }

    const items = await prisma.companyItem.findMany({
      where: {
        itemListId: params.itemListId,
        itemList: {
          moveId: params.moveId
        }
      },
      include: {
        originRoom: true,
        destinationRoom: true,
        stopRoom: true
      }
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const { id, ...updateData } = json;

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Verify move belongs to user's organization
    const move = await prisma.companyMove.findUnique({
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
        id,
        itemListId: params.itemListId,
        itemList: {
          moveId: params.moveId
        }
      }
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const updatedItem = await prisma.companyItem.update({
      where: { id },
      data: updateData,
      include: {
        originRoom: true,
        destinationRoom: true,
        stopRoom: true
      }
    });

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Verify move belongs to user's organization
    const move = await prisma.companyMove.findUnique({
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
        id: itemId,
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
      where: { id: itemId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 