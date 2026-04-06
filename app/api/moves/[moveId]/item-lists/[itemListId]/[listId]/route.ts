import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { moveId, itemListId } = params;
    if (!moveId || !itemListId) {
      return NextResponse.json(
        { success: false, error: "Move ID and Item List ID are required" },
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

    const itemList = await prisma.itemList.findUnique({
      where: {
        id: itemListId,
      },
      include: {
        items: true,
      },
    });

    if (!itemList) {
      return NextResponse.json(
        { success: false, error: { message: 'Item list not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: itemList });
  } catch (error) {
    console.error('Error fetching item list:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch item list' } },
      { status: 500 }
    );
  }
} 