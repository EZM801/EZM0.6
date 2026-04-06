import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { UpdateItemInput } from '@/app/types/ItemType';

// GET /api/items/[itemId] - Get a specific item
export async function GET(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const item = await prisma.item.findFirst({
      where: {
        id: params.itemId,
        itemList: {
          move: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!item) {
      return new NextResponse('Item not found', { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('[ITEM_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT /api/items/[itemId] - Update an item
export async function PUT(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await request.json();
    const { name, description, quantity, dimensions, weight, specialInstructions } = json;

    const item = await prisma.item.update({
      where: {
        id: params.itemId,
        itemList: {
          move: {
            userId: session.user.id,
          },
        },
      },
      data: {
        name,
        description,
        quantity,
        dimensions,
        weight,
        specialInstructions,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('[ITEM_PUT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/items/[itemId] - Delete an item
export async function DELETE(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.item.delete({
      where: {
        id: params.itemId,
        itemList: {
          move: {
            userId: session.user.id,
          },
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ITEM_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 