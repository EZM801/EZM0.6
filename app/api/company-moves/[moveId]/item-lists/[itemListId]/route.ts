import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const itemListSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
});

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
    const body = itemListSchema.parse(json);

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

    // Verify item list belongs to the move
    const existingItemList = await prisma.companyItemList.findFirst({
      where: {
        id: params.itemListId,
        moveId: params.moveId
      }
    });

    if (!existingItemList) {
      return NextResponse.json({ error: 'Item list not found' }, { status: 404 });
    }

    const updatedItemList = await prisma.companyItemList.update({
      where: { id: params.itemListId },
      data: body,
      include: {
        items: {
          include: {
            originRoom: true,
            destinationRoom: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: updatedItemList });
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

    // Verify item list belongs to the move
    const existingItemList = await prisma.companyItemList.findFirst({
      where: {
        id: params.itemListId,
        moveId: params.moveId
      }
    });

    if (!existingItemList) {
      return NextResponse.json({ error: 'Item list not found' }, { status: 404 });
    }

    await prisma.companyItemList.delete({
      where: { id: params.itemListId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 