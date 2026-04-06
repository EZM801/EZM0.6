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
  packingStatus: z.string().default("UNPACKED"),
});

export async function POST(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string } }
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
      return NextResponse.json({ error: 'Move not found' }, { status: 404 });
    }

    if (!move.itemLists.length) {
      return NextResponse.json({ error: 'Item list not found' }, { status: 404 });
    }

    const item = await prisma.companyItem.create({
      data: {
        ...body,
        itemListId: params.itemListId
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
  { params }: { params: { moveId: string; itemListId: string } }
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

    const items = await prisma.companyItem.findMany({
      where: {
        itemListId: params.itemListId,
        itemList: {
          moveId: params.moveId
        }
      }
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 