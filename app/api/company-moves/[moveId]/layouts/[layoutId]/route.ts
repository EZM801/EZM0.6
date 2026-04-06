import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const layoutSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  instructions: z.string().optional(),
  orientation: z.enum(['ORIGIN', 'DESTINATION', 'STOP']).default('ORIGIN'),
});

export async function GET(
  request: Request,
  { params }: { params: { moveId: string; layoutId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify move belongs to user's organization
    const move = await prisma.companyMove.findUnique({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      }
    });

    if (!move) {
      return NextResponse.json({ error: 'Move not found' }, { status: 404 });
    }

    const layout = await prisma.companyMoveLayout.findFirst({
      where: {
        id: params.layoutId,
        moveId: params.moveId
      },
      include: {
        rooms: true
      }
    });

    if (!layout) {
      return NextResponse.json({ error: 'Layout not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: layout });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { moveId: string; layoutId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const body = layoutSchema.parse(json);

    // Verify move belongs to user's company
    const move = await prisma.companyMove.findUnique({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      }
    });

    if (!move) {
      return NextResponse.json({ error: 'Move not found' }, { status: 404 });
    }

    // Verify layout belongs to the move
    const existingLayout = await prisma.companyMoveLayout.findFirst({
      where: {
        id: params.layoutId,
        moveId: params.moveId
      }
    });

    if (!existingLayout) {
      return NextResponse.json({ error: 'Layout not found' }, { status: 404 });
    }

    const updatedLayout = await prisma.companyMoveLayout.update({
      where: { id: params.layoutId },
      data: body,
      include: {
        rooms: true
      }
    });

    return NextResponse.json({ success: true, data: updatedLayout });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string; layoutId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify move belongs to user's company
    const move = await prisma.companyMove.findUnique({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      }
    });

    if (!move) {
      return NextResponse.json({ error: 'Move not found' }, { status: 404 });
    }

    // Verify layout belongs to the move
    const existingLayout = await prisma.companyMoveLayout.findFirst({
      where: {
        id: params.layoutId,
        moveId: params.moveId
      }
    });

    if (!existingLayout) {
      return NextResponse.json({ error: 'Layout not found' }, { status: 404 });
    }

    await prisma.companyMoveLayout.delete({
      where: { id: params.layoutId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}