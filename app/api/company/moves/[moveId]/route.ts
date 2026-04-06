import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const updateMoveSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  moveType: z.string().optional(),
  startDate: z.union([z.string(), z.date(), z.null()]).transform(val => {
    if (!val) return null;
    if (val instanceof Date) return val;
    return new Date(val);
  }).optional(),
  endDate: z.union([z.string(), z.date(), z.null()]).transform(val => {
    if (!val) return null;
    if (val instanceof Date) return val;
    return new Date(val);
  }).optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().transform(val => val === "" ? undefined : val).optional().refine(val => !val || z.string().email().safeParse(val).success, {
    message: "Invalid email"
  }).optional(),
  clientPhone: z.string().optional(),
  estimatedBudget: z.union([z.string(), z.number(), z.null()]).transform(val => {
    if (!val) return null;
    if (typeof val === 'number') return val;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed;
  }).optional(),
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
    console.log("Received update data:", json);

    try {
      const body = updateMoveSchema.parse(json);
      console.log("Validated data:", body);

      // Verify the move exists and belongs to the company
      const move = await prisma.companyMove.findFirst({
        where: {
          id: params.moveId,
          companyId: session.user.companyId!
        }
      });

      if (!move) {
        console.log("Move not found:", params.moveId);
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
          startDate: body.startDate || undefined,
          endDate: body.endDate || undefined,
          clientName: body.clientName,
          clientEmail: body.clientEmail,
          clientPhone: body.clientPhone,
          estimatedBudget: body.estimatedBudget,
          priority: body.priority,
          specialInstructions: body.specialInstructions,
        },
      });

      console.log("Move updated successfully:", updatedMove);
      return NextResponse.json(updatedMove);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return new NextResponse(JSON.stringify({ error: "Invalid request data", details: error.errors }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("[MOVE_UPDATE] Error:", error);
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