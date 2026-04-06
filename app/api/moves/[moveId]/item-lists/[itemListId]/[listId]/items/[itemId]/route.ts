import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { UpdateItemInput } from '@/app/types/ItemType';

export async function PATCH(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { moveId, itemListId, itemId } = params;
    if (!moveId || !itemListId || !itemId) {
      return NextResponse.json(
        { success: false, error: { message: 'Move ID, Item List ID, and Item ID are required' } },
        { status: 400 }
      );
    }

    // Verify move access
    const move = await prisma.move.findFirst({
      where: {
        id: moveId,
        OR: [
          { userId: session.user.id },
          { company: { users: { some: { id: session.user.id } } } }
        ]
      }
    });

    if (!move) {
      return NextResponse.json(
        { success: false, error: { message: 'Move not found or access denied' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updateData: UpdateItemInput = body;

    const item = await prisma.item.update({
      where: {
        id: itemId,
        itemList: {
          id: itemListId,
          moveId: moveId,
        },
      },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to update item' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { moveId, itemListId, itemId } = params;
    if (!moveId || !itemListId || !itemId) {
      return NextResponse.json(
        { success: false, error: { message: 'Move ID, Item List ID, and Item ID are required' } },
        { status: 400 }
      );
    }

    // Verify move access
    const move = await prisma.move.findFirst({
      where: {
        id: moveId,
        OR: [
          { userId: session.user.id },
          { company: { users: { some: { id: session.user.id } } } }
        ]
      }
    });

    if (!move) {
      return NextResponse.json(
        { success: false, error: { message: 'Move not found or access denied' } },
        { status: 404 }
      );
    }

    await prisma.item.delete({
      where: {
        id: itemId,
        itemList: {
          id: itemListId,
          moveId: moveId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to delete item' } },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string; itemId: string } }
) {
  try {
    const { moveId, itemListId, itemId } = params;
    if (!moveId || !itemListId || !itemId) {
      return NextResponse.json(
        { success: false, error: "Move ID, Item List ID, and Item ID are required" },
        { status: 400 }
      );
    }

    // ... rest of the code ...

    const item = await prisma.item.findUnique({
      where: {
        id: itemId,
        itemListId: itemListId,
      },
    });

    // ... rest of the code ...
  } catch (error) {
    console.error('Error getting item:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to get item' } },
      { status: 500 }
    );
  }
} 