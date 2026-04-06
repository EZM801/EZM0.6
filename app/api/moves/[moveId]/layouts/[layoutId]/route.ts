import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const updateLayoutSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  instructions: z.string().optional(),
  orientation: z.enum(["origin", "destination", "stop"]).optional()
});

// Frontend type
type LayoutType = "current" | "new";

// Backend mapping
const orientationMap = {
  current: "origin",
  new: "destination"
} as const;

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

// GET /api/moves/[moveId]/layouts/[layoutId] - Get a specific layout
export async function GET(
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
    const layout = await prisma.layout.findFirst({
      where: {
        id: layoutId,
        moveId
      },
      include: {
        rooms: true
      }
    });

    if (!layout) {
      return NextResponse.json(
        { success: false, error: { message: "Layout not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: layout });
  } catch (error) {
    console.error("Error fetching layout:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal Server Error" } },
      { status: 500 }
    );
  }
}

// PUT /api/moves/[moveId]/layouts/[layoutId] - Update a layout
export async function PUT(
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
    const body = await request.json();
    const validatedData = updateLayoutSchema.parse(body);

    // Check if layout exists
    const existingLayout = await prisma.layout.findFirst({
      where: {
        id: layoutId,
        moveId
      }
    });

    if (!existingLayout) {
      return NextResponse.json(
        { success: false, error: { message: "Layout not found" } },
        { status: 404 }
      );
    }

    // If orientation is being updated, check for conflicts
    if (validatedData.orientation && validatedData.orientation !== existingLayout.orientation) {
      const conflictingLayout = await prisma.layout.findFirst({
        where: {
          moveId,
          orientation: validatedData.orientation,
          id: { not: layoutId }
        }
      });

      if (conflictingLayout) {
        return NextResponse.json(
          { success: false, error: { message: `A ${validatedData.orientation} layout already exists for this move` } },
          { status: 400 }
        );
      }
    }

    const updatedLayout = await prisma.layout.update({
      where: { id: layoutId },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        rooms: true
      }
    });

    return NextResponse.json({ success: true, data: updatedLayout });
  } catch (error) {
    console.error("Error updating layout:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid input", details: error.errors } },
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
    if (!moveId) {
      return NextResponse.json(
        { success: false, error: { message: "Move ID is required" } },
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

    // Handle special case for "current" layout
    const isCurrentLayout = layoutId === "current";
    const existingLayout = await prisma.layout.findFirst({
      where: {
        moveId: moveId,
        ...(isCurrentLayout 
          ? { orientation: "origin" }
          : { id: layoutId }
        )
      }
    });

    if (!existingLayout) {
      return NextResponse.json(
        { success: false, error: { message: "Layout not found" } },
        { status: 404 }
      );
    }

    // Delete layout
    await prisma.layout.delete({
      where: { id: existingLayout.id }
    });

    return NextResponse.json({ 
      success: true, 
      data: { message: "Layout deleted successfully" } 
    });
  } catch (error) {
    console.error("[LAYOUT_DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal Server Error" } },
      { status: 500 }
    );
  }
} 