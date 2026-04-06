import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const updateCompanyMoveSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  moveType: z.string().optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional(),
  clientPhone: z.string().optional(),
  estimatedBudget: z.number().optional(),
  priority: z.string().optional(),
  fromAddressId: z.string().optional(),
  toAddressId: z.string().optional(),
  specialInstructions: z.string().optional(),
  status: z.string().optional(),
});

const updateMoveSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  moveType: z.string().optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional(),
  clientPhone: z.string().optional(),
  estimatedBudget: z.number().nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  specialInstructions: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("Fetching move details for ID:", params.moveId);
    console.log("Company ID:", session.user.companyId);

    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      },
      include: {
        fromAddress: true,
        toAddress: true,
        tasks: {
          include: {
            assignedTo: true
          },
          orderBy: {
            startDate: 'asc'
          }
        },
        employees: {
          include: {
            employee: true
          }
        },
        vehicles: {
          include: {
            vehicle: true
          }
        },
        equipment: {
          include: {
            equipment: true
          }
        },
        layouts: {
          include: {
            rooms: {
              include: {
                originItems: true,
                destinationItems: true,
                stopItems: true
              }
            }
          }
        },
        itemLists: {
          include: {
            items: {
              include: {
                originRoom: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                destinationRoom: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log("Move found:", move ? "yes" : "no");

    if (!move) {
      console.log("Move not found, returning 404");
      return NextResponse.json({ error: 'Move not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: move });
  } catch (error) {
    console.error("Error fetching move details:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
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
    const body = updateMoveSchema.parse(json);

    // Verify the move exists and belongs to the company
    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      }
    });

    if (!move) {
      return new NextResponse("Move not found", { status: 404 });
    }

    // Update the move
    const updatedMove = await prisma.companyMove.update({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      },
      data: {
        name: body.name,
        description: body.description,
        moveType: body.moveType,
        startDate: body.startDate,
        endDate: body.endDate,
        clientName: body.clientName,
        clientEmail: body.clientEmail,
        clientPhone: body.clientPhone,
        estimatedBudget: body.estimatedBudget,
        priority: body.priority,
        specialInstructions: body.specialInstructions,
      },
    });

    return NextResponse.json(updatedMove);
  } catch (error) {
    console.error("[MOVE_UPDATE]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.companyMove.delete({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 