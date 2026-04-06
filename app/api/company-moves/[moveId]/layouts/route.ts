import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const layoutSchema = z.object({
  name: z.string().min(1),
  instructions: z.string().optional(),
  orientation: z.enum(['ORIGIN', 'DESTINATION', 'STOP']).default('ORIGIN'),
});

export async function POST(
  req: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await req.json();
    const body = layoutSchema.parse(json);

    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId,
      },
    });

    if (!move) {
      return new NextResponse('Move not found', { status: 404 });
    }

    const layout = await prisma.companyMoveLayout.create({
      data: {
        name: body.name,
        instructions: body.instructions,
        orientation: body.orientation,
        moveId: params.moveId,
      },
    });

    return NextResponse.json(layout);
  } catch (error) {
    console.error('[LAYOUT_CREATE]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId,
      },
      include: {
        layouts: {
          include: {
            rooms: true,
          },
        },
      },
    });

    if (!move) {
      return new NextResponse('Move not found', { status: 404 });
    }

    return NextResponse.json(move.layouts);
  } catch (error) {
    console.error('[LAYOUTS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 