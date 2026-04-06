import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

const createCompanyMoveSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  moveType: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  estimatedBudget: z.string().optional(),
  estimatedHours: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  fromAddress: addressSchema.optional(),
  stops: z.array(addressSchema).optional(),
  toAddress: addressSchema.optional(),
  specialInstructions: z.string().optional(),
  assignedEmployees: z.array(z.string()).optional(),
  assignedVehicles: z.array(z.string()).optional(),
  assignedEquipment: z.array(z.string()).optional(),
  tasks: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    assignedToId: z.string().optional(),
  })).optional(),
  layouts: z.array(z.object({
    name: z.string(),
    instructions: z.string().optional(),
    orientation: z.enum(["ORIGIN", "DESTINATION", "STOP"]).default("ORIGIN"),
  })).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const body = createCompanyMoveSchema.parse(json);

    // Create addresses
    const fromAddress = body.fromAddress ? await prisma.address.create({
      data: {
        id: uuidv4(),
        street: body.fromAddress.street || "",
        city: body.fromAddress.city || "",
        state: body.fromAddress.state || "",
        zipCode: body.fromAddress.zipCode || "",
        country: "US",
      }
    }) : null;

    const toAddress = body.toAddress ? await prisma.address.create({
      data: {
        id: uuidv4(),
        street: body.toAddress.street || "",
        city: body.toAddress.city || "",
        state: body.toAddress.state || "",
        zipCode: body.toAddress.zipCode || "",
        country: "US",
      }
    }) : null;

    // Create the move
    const companyMove = await prisma.companyMove.create({
      data: {
        id: uuidv4(),
        name: body.name,
        description: body.description || "",
        moveType: body.moveType || "residential",
        status: "PENDING",
        startDate: body.startDate || new Date(),
        endDate: body.endDate || new Date(),
        clientName: body.clientName || "",
        clientEmail: body.clientEmail || "",
        clientPhone: body.clientPhone || "",
        estimatedBudget: body.estimatedBudget ? parseFloat(body.estimatedBudget) : null,
        priority: body.priority,
        companyId: session.user.companyId,
        createdById: session.user.id,
        fromAddressId: fromAddress?.id || uuidv4(),
        toAddressId: toAddress?.id || uuidv4(),
        specialInstructions: body.specialInstructions || "",
      }
    });

    // Create default addresses if none were provided
    if (!fromAddress) {
      await prisma.address.create({
        data: {
          id: companyMove.fromAddressId,
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "US",
        }
      });
    }

    if (!toAddress) {
      await prisma.address.create({
        data: {
          id: companyMove.toAddressId,
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "US",
        }
      });
    }

    // Create stops if any
    if (body.stops && body.stops.length > 0) {
      await prisma.moveStop.createMany({
        data: body.stops.map((stop: any) => ({
          id: uuidv4(),
          moveId: companyMove.id,
          name: stop.name || "Stop",
          address: stop.street || "",
          city: stop.city || "",
          state: stop.state || "",
          zipCode: stop.zipCode || "",
          country: stop.country || "US",
          notes: stop.notes || "",
          updatedAt: new Date(),
        }))
      });
    }

    // Create tasks if any
    if (body.tasks && body.tasks.length > 0) {
      await prisma.companyMoveTask.createMany({
        data: body.tasks.map((task: any) => ({
          id: uuidv4(),
          moveId: companyMove.id,
          name: task.name,
          description: task.description || "",
          status: "TODO",
          priority: task.priority || "MEDIUM",
          startDate: task.startDate || new Date(),
          endDate: task.endDate || new Date(),
          assignedToId: task.assignedToId,
        }))
      });
    }

    // Create layouts if any
    if (body.layouts && body.layouts.length > 0) {
      await prisma.companyMoveLayout.createMany({
        data: body.layouts.map((layout: any) => ({
          id: uuidv4(),
          moveId: companyMove.id,
          name: layout.name,
          instructions: layout.instructions || "",
          orientation: layout.orientation || "ORIGIN",
        }))
      });
    }

    // Create assigned employees if any
    if (body.assignedEmployees && body.assignedEmployees.length > 0) {
      await prisma.companyMoveEmployee.createMany({
        data: body.assignedEmployees.map((employeeId: string) => ({
          id: uuidv4(),
          moveId: companyMove.id,
          employeeId: employeeId,
          role: "MOVER",
          startDate: new Date(),
        }))
      });
    }

    // Create assigned vehicles if any
    if (body.assignedVehicles && body.assignedVehicles.length > 0) {
      await prisma.companyMoveVehicle.createMany({
        data: body.assignedVehicles.map((vehicleId: string) => ({
          id: uuidv4(),
          moveId: companyMove.id,
          vehicleId: vehicleId,
          startDate: new Date(),
        }))
      });
    }

    // Create assigned equipment if any
    if (body.assignedEquipment && body.assignedEquipment.length > 0) {
      await prisma.companyMoveEquipment.createMany({
        data: body.assignedEquipment.map((equipmentId: string) => ({
          id: uuidv4(),
          moveId: companyMove.id,
          equipmentId: equipmentId,
          quantity: 1,
          startDate: new Date(),
        }))
      });
    }

    return NextResponse.json({ success: true, data: companyMove });
  } catch (error) {
    console.error("Error creating move:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create move" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    console.log("Fetching moves for company:", session.user.companyId);

    const moves = await prisma.companyMove.findMany({
      where: {
        companyId: session.user.companyId!,
        ...(status && { status }),
        ...(priority && { priority })
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        priority: true,
        startDate: true,
        endDate: true,
        clientName: true,
        moveType: true,
        fromAddress: true,
        toAddress: true,
        tasks: {
          select: {
            id: true,
            name: true,
            status: true,
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        layouts: true,
        itemLists: true,
        employees: {
          select: {
            id: true,
            role: true,
            startDate: true,
            endDate: true,
            employeeId: true
          }
        },
        vehicles: {
          select: {
            id: true,
            vehicle: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        },
        equipment: {
          select: {
            id: true,
            equipment: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    console.log("Found moves:", moves.length);

    return NextResponse.json({ 
      success: true, 
      data: moves,
      meta: {
        total: moves.length,
        companyId: session.user.companyId
      }
    });
  } catch (error) {
    console.error("Error fetching moves:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch moves" },
      { status: 500 }
    );
  }
} 