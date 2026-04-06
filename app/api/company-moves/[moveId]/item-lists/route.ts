import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createItemListSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.userType !== "COMPANY") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const json = await req.json();
    const body = createItemListSchema.parse(json);

    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!,
      },
    });

    if (!move) {
      return new NextResponse("Move not found", { status: 404 });
    }

    const itemList = await prisma.companyItemList.create({
      data: {
        name: body.name,
        description: body.description || "",
        moveId: params.moveId,
      },
    });

    return NextResponse.json(itemList);
  } catch (error) {
    console.error("[ITEM_LIST_CREATE]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId,
      },
      include: {
        itemLists: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!move) {
      return new NextResponse("Move not found", { status: 404 });
    }

    return NextResponse.json(move.itemLists);
  } catch (error) {
    console.error("[ITEM_LISTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 