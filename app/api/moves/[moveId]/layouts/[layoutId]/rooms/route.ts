import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { CreateRoomRequest, Room } from '@/app/types/LayoutType';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

// Validation schemas
const createRoomSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional()
});

// Helper function to verify move access
async function verifyMoveAccess(moveId: string, userId: string) {
  const move = await prisma.move.findFirst({
    where: {
      id: moveId,
      OR: [
        { userId },
        {
          company: {
            users: {
              some: { id: userId }
            }
          }
        }
      ]
    }
  });
  return move;
}

export async function GET(
  request: Request,
  { params }: { params: { moveId: string; layoutId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { moveId, layoutId } = params;

    // First verify that the user has access to this move and layout
    const move = await prisma.move.findFirst({
      where: {
        id: moveId,
        OR: [
          { userId: session.user.id },
          {
            company: {
              users: {
                some: {
                  id: session.user.id
                }
              }
            }
          }
        ]
      }
    });

    if (!move) {
      return NextResponse.json(
        { success: false, error: "Move not found" },
        { status: 404 }
      );
    }

    const layout = await prisma.layout.findFirst({
      where: {
        id: layoutId,
        moveId: moveId
      }
    });

    if (!layout) {
      return NextResponse.json(
        { success: false, error: "Layout not found" },
        { status: 404 }
      );
    }

    // Get the rooms for this layout
    const rooms = await prisma.room.findMany({
      where: {
        layoutId: layoutId
      }
    });

    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    console.error("[ROOMS_GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { moveId: string; layoutId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { moveId, layoutId } = params;
    if (!moveId || !layoutId) {
      return NextResponse.json(
        { success: false, error: { message: "Move ID and Layout ID are required" } },
        { status: 400 }
      );
    }

    // Verify move access
    const move = await verifyMoveAccess(moveId, session.user.id);
    if (!move) {
      return NextResponse.json(
        { success: false, error: { message: "Move not found" } },
        { status: 404 }
      );
    }

    // Validate request body
    const json = await request.json();
    const validatedData = createRoomSchema.parse(json);

    // Create room
    const room = await prisma.room.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        layoutId: layoutId,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: room 
    });
  } catch (error) {
    console.error("[ROOM_POST] Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: "Validation failed", details: error.errors } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: "Internal Server Error" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string; layoutId: string; roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { moveId, layoutId, roomId } = params;
    if (!moveId || !layoutId || !roomId) {
      return NextResponse.json(
        { success: false, error: { message: "Move ID, Layout ID, and Room ID are required" } },
        { status: 400 }
      );
    }

    // Verify move access
    const move = await verifyMoveAccess(moveId, session.user.id);
    if (!move) {
      return NextResponse.json(
        { success: false, error: { message: "Move not found" } },
        { status: 404 }
      );
    }

    // Delete room
    await prisma.room.delete({
      where: { id: roomId }
    });

    return NextResponse.json({ 
      success: true, 
      data: { message: "Room deleted successfully" } 
    });
  } catch (error) {
    console.error("[ROOM_DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal Server Error" } },
      { status: 500 }
    );
  }
} 