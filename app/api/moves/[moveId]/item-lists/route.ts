import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { z } from 'zod';

const createItemListSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Please sign in to view item lists' } },
        { status: 401 }
      );
    }

    const moveId = params.moveId;
    if (!moveId) {
      return NextResponse.json(
        { success: false, error: { message: 'Move ID is required' } },
        { status: 400 }
      );
    }

    // Verify move belongs to user
    const move = await prisma.move.findFirst({
      where: {
        id: moveId,
        userId: session.user.id,
      },
    });

    if (!move) {
      return NextResponse.json(
        { success: false, error: { message: 'Move not found or you do not have permission to view it' } },
        { status: 404 }
      );
    }

    const itemLists = await prisma.itemList.findMany({
      where: {
        moveId: moveId,
      },
      include: {
        items: {
          include: {
            photos: true,
            qrCodes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: itemLists });
  } catch (error) {
    console.error('Error fetching item lists:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Unable to fetch item lists at this time. Please try again later.' } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Please sign in to create item lists' } },
        { status: 401 }
      );
    }

    const moveId = params.moveId;
    if (!moveId) {
      return NextResponse.json(
        { success: false, error: { message: 'Move ID is required' } },
        { status: 400 }
      );
    }

    // Verify move belongs to user
    const move = await prisma.move.findFirst({
      where: {
        id: moveId,
        userId: session.user.id,
      },
    });

    if (!move) {
      return NextResponse.json(
        { success: false, error: { message: 'Move not found or you do not have permission to update it' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = createItemListSchema.parse(body);

    const itemList = await prisma.itemList.create({
      data: {
        ...validatedData,
        moveId: moveId,
      },
      include: {
        items: {
          include: {
            photos: true,
            qrCodes: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: itemList,
      message: 'Item list created successfully' 
    });
  } catch (error) {
    console.error('Error creating item list:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Please check your input and try again', details: error.errors } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: 'Unable to create item list at this time. Please try again later.' } },
      { status: 500 }
    );
  }
} 