import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const taskSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).default("TODO"),
  assignedTo: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        moveId: params.moveId,
        move: {
          OR: [
            { userId: session.user.id },
            {
              company: {
                users: {
                  some: { id: session.user.id }
                }
              }
            }
          ]
        }
      },
      include: {
        assignedToUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("[TASKS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    const body = taskSchema.parse(json);

    const task = await prisma.task.create({
      data: {
        name: body.name,
        description: body.description,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        priority: body.priority || "normal",
        status: body.status || "pending",
        moveId: params.moveId,
        userId: session.user.id,
        assignedTo: body.assignedTo,
        updatedAt: new Date(),
      },
      include: {
        assignedToUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASKS_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
