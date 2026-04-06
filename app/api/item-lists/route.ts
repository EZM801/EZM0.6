import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { CreateItemListInput } from '@/app/types/ItemListType';

// GET /api/item-lists - Get all item lists for a move
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const moveId = searchParams.get('moveId');

    if (!moveId) {
      return NextResponse.json(
        { error: 'Move ID is required' },
        { status: 400 }
      );
    }

    // Verify move belongs to user
    const move = await prisma.move.findFirst({
      where: {
        id: moveId,
        user: {
          email: session.user.email
        }
      }
    });

    if (!move) {
      return NextResponse.json(
        { error: 'Move not found or access denied' },
        { status: 404 }
      );
    }

    const itemLists = await prisma.itemList.findMany({
      where: {
        moveId
      },
      include: {
        items: true
      }
    });

    return NextResponse.json(itemLists);
  } catch (error) {
    console.error('Error fetching item lists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item lists' },
      { status: 500 }
    );
  }
}

// POST /api/item-lists - Create a new item list
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateItemListInput = await request.json();

    // Verify move belongs to user
    const move = await prisma.move.findFirst({
      where: {
        id: body.moveId,
        user: {
          email: session.user.email
        }
      }
    });

    if (!move) {
      return NextResponse.json(
        { error: 'Move not found or access denied' },
        { status: 404 }
      );
    }

    const itemList = await prisma.itemList.create({
      data: body,
      include: {
        items: true
      }
    });

    return NextResponse.json(itemList, { status: 201 });
  } catch (error) {
    console.error('Error creating item list:', error);
    return NextResponse.json(
      { error: 'Failed to create item list' },
      { status: 500 }
    );
  }
} 