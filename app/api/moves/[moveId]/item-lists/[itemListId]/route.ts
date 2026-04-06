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

const updateItemListSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
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
      },
      include: {
        items: {
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
        }
      }
    });

    if (!itemList) {
      return NextResponse.json(
        { success: false, error: { message: 'Item list not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...itemList,
        createdAt: itemList.createdAt.toISOString(),
        updatedAt: itemList.updatedAt.toISOString(),
        items: itemList.items.map(item => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString()
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching item list:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal Server Error' } },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const validatedData = updateItemListSchema.parse(body);

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

    // Update the item list
    const updatedItemList = await prisma.itemList.update({
      where: { id: params.itemListId },
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
      },
      include: {
        items: {
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
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedItemList,
        createdAt: updatedItemList.createdAt.toISOString(),
        updatedAt: updatedItemList.updatedAt.toISOString(),
        items: updatedItemList.items.map(item => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString()
        }))
      }
    });
  } catch (error) {
    console.error('Error updating item list:', error);
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

export async function DELETE(
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

    // Delete the item list
    await prisma.itemList.delete({
      where: { id: params.itemListId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item list:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal Server Error' } },
      { status: 500 }
    );
  }
} 