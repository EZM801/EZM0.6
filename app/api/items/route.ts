import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { CreateItemInput } from '@/app/types/ItemType';

// GET /api/items - Get all items for an item list
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemListId = searchParams.get('itemListId');

    if (!itemListId) {
      return NextResponse.json(
        { error: 'Item List ID is required' },
        { status: 400 }
      );
    }

    // Verify item list belongs to user's move
    const itemList = await prisma.itemList.findFirst({
      where: {
        id: itemListId,
        move: {
          user: {
            email: session.user.email
          }
        }
      }
    });

    if (!itemList) {
      return NextResponse.json(
        { error: 'Item list not found or access denied' },
        { status: 404 }
      );
    }

    const items = await prisma.item.findMany({
      where: {
        itemListId
      }
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST /api/items - Create a new item
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateItemInput = await request.json();

    // Verify item list belongs to user's move
    const itemList = await prisma.itemList.findFirst({
      where: {
        id: body.itemListId,
        move: {
          user: {
            email: session.user.email
          }
        }
      }
    });

    if (!itemList) {
      return NextResponse.json(
        { error: 'Item list not found or access denied' },
        { status: 404 }
      );
    }

    const item = await prisma.item.create({
      data: body
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
} 