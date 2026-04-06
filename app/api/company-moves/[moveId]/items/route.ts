import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const itemSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.string(),
  quantity: z.number().int().positive(),
  status: z.enum(['PENDING', 'PACKED', 'LOADED', 'UNLOADED', 'UNPACKED']).default('PENDING'),
  roomId: z.string().optional(),
  layoutId: z.string().optional(),
  specialInstructions: z.string().optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  weight: z.number().optional(),
  value: z.number().optional(),
  itemListId: z.string(),
});

export async function POST(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const body = itemSchema.parse(json);

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

    const item = await prisma.companyItem.create({
      data: {
        ...body,
        itemListId: body.itemListId
      }
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if we're requesting a specific item
    const url = new URL(request.url);
    const itemId = url.pathname.split('/').pop();
    
    if (itemId && itemId !== params.moveId) {
      // Get single item
      const item = await prisma.companyItem.findFirst({
        where: {
          id: itemId,
          itemList: {
            moveId: params.moveId
          }
        },
        include: {
          originRoom: true,
          destinationRoom: true,
          stopRoom: true,
          itemList: true
        }
      });

      if (!item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: item });
    }

    // Get all items for the move
    const items = await prisma.companyItem.findMany({
      where: {
        itemList: {
          moveId: params.moveId
        }
      },
      include: {
        originRoom: true,
        destinationRoom: true,
        stopRoom: true,
        itemList: true
      }
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 