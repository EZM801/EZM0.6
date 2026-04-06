import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Validation schemas
const createLayoutSchema = z.object({
  name: z.string().min(1, "Layout name is required"),
  orientation: z.enum(["origin", "destination", "stop"]),
  instructions: z.string().optional(),
});

const updateLayoutSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  instructions: z.string().optional(),
  orientation: z.enum(["origin", "destination", "stop"]).optional()
});

// GET /api/moves/[moveId]/layouts - List all layouts for a move
export async function GET(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const moveId = params.moveId;
    const layouts = await prisma.layout.findMany({
      where: { moveId },
      include: { rooms: true }
    });

    return NextResponse.json({ success: true, data: layouts });
  } catch (error) {
    console.error("Error fetching layouts:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal Server Error" } },
      { status: 500 }
    );
  }
}

// POST /api/moves/[moveId]/layouts - Create a new layout
export async function POST(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { moveId } = params;
    if (!moveId) {
      return NextResponse.json(
        { success: false, error: { message: "Move ID is required" } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createLayoutSchema.parse(body);

    // Verify move exists and belongs to user
    const move = await prisma.move.findUnique({
      where: { id: moveId },
      include: { user: true }
    });

    if (!move || move.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Move not found" } },
        { status: 404 }
      );
    }

    const now = new Date();

    // For stop layouts, we need to get the moveStopId
    let moveStopId = null;
    if (validatedData.orientation === "stop") {
      const moveStop = await prisma.moveStop.findFirst({
        where: { moveId },
        orderBy: { createdAt: 'desc' }
      });
      
      if (!moveStop) {
        return NextResponse.json(
          { success: false, error: { message: "No stop found for this move" } },
          { status: 400 }
        );
      }
      
      moveStopId = moveStop.id;
    }

    const layout = await prisma.layout.create({
      data: {
        name: validatedData.name,
        moveId: moveId,
        instructions: validatedData.instructions || null,
        orientation: validatedData.orientation,
        createdAt: now,
        updatedAt: now,
        moveStopId: moveStopId
      }
    });

    return NextResponse.json({ success: true, data: layout });
  } catch (error) {
    console.error("Error creating layout:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid request data", details: error.errors } },
        { status: 400 }
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        console.error("Unique constraint error details:", error.meta);
        return NextResponse.json(
          { success: false, error: { message: "Invalid layout configuration", details: error.meta } },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { success: false, error: { message: "Internal Server Error" } },
      { status: 500 }
    );
  }
}

// DELETE /api/moves/[moveId]/layouts?layoutId=xxx - Delete a layout
export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const moveId = params.moveId;
    const { searchParams } = new URL(request.url);
    const layoutId = searchParams.get('layoutId');

    if (!layoutId) {
      return NextResponse.json(
        { success: false, error: { message: "Layout ID is required" } },
        { status: 400 }
      );
    }

    await prisma.layout.delete({
      where: { id: layoutId }
    });

    return NextResponse.json({ success: true, message: "Layout deleted successfully" });
  } catch (error) {
    console.error("Error deleting layout:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal Server Error" } },
      { status: 500 }
    );
  }
} 