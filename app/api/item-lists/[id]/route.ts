import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { UpdateItemListInput } from '@/app/types/ItemListType';

// GET /api/item-lists/[itemListId] - Get a specific item list
export async function GET(
  request: Request,
  { params }: { params: { itemListId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const itemList = await prisma.itemList.findFirst({
      where: {
        id: params.itemListId,
        move: {
          userId: session.user.id,
        },
      },
      include: {
        items: true,
      },
    });

    if (!itemList) {
      return new NextResponse('Item list not found', { status: 404 });
    }

    return NextResponse.json(itemList);
  } catch (error) {
    console.error('[ITEM_LIST_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT /api/item-lists/[itemListId] - Update an item list
export async function PUT(
  request: Request,
  { params }: { params: { itemListId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await request.json();
    const { name, description } = json;

    const itemList = await prisma.itemList.update({
      where: {
        id: params.itemListId,
        move: {
          userId: session.user.id,
        },
      },
      data: {
        name,
        description,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(itemList);
  } catch (error) {
    console.error('[ITEM_LIST_PUT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/item-lists/[itemListId] - Delete an item list
export async function DELETE(
  request: Request,
  { params }: { params: { itemListId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.itemList.delete({
      where: {
        id: params.itemListId,
        move: {
          userId: session.user.id,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ITEM_LIST_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 