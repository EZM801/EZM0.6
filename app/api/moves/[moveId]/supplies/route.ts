import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const moveSupplySchema = z.object({
  supplyId: z.string().uuid(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export async function GET(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify move exists and belongs to user
    const move = await prisma.move.findFirst({
      where: {
        id: params.moveId,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      }
    });

    if (!move) {
      return new NextResponse("Move not found", { status: 404 });
    }

    // Fetch move supplies
    const moveSupplies = await prisma.moveSupply.findMany({
      where: {
        moveId: params.moveId
      }
    });

    // Fetch supplies separately
    const supplies = await prisma.supply.findMany({
      where: {
        id: {
          in: moveSupplies.map(ms => ms.supplyId)
        }
      }
    });

    // Combine the data
    const result = moveSupplies.map(ms => ({
      ...ms,
      supply: supplies.find(s => s.id === ms.supplyId)
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[MOVE_SUPPLIES_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = moveSupplySchema.parse(body);

    // Verify move exists and belongs to user
    const move = await prisma.move.findFirst({
      where: {
        id: params.moveId,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                role: { in: ["owner", "editor"] }
              }
            }
          }
        ]
      }
    });

    if (!move) {
      return new NextResponse("Move not found", { status: 404 });
    }

    // Verify supply exists and is active
    const supply = await prisma.supply.findFirst({
      where: {
        id: validatedData.supplyId,
        isActive: true,
        OR: [
          { userId: session.user.id },
          { companyId: session.user.companyId }
        ]
      }
    });

    if (!supply) {
      return new NextResponse("Supply not found or not active", { status: 404 });
    }

    // Create move supply
    const moveSupply = await prisma.moveSupply.create({
      data: {
        moveId: params.moveId,
        supplyId: validatedData.supplyId,
        quantity: validatedData.quantity,
        assignedAt: new Date()
      }
    });

    // Return the created move supply with the supply details
    return NextResponse.json({
      ...moveSupply,
      supply
    });
  } catch (error) {
    console.error("[MOVE_SUPPLIES_POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = moveSupplySchema.parse(body);

    // Verify move exists and belongs to user
    const move = await prisma.move.findFirst({
      where: {
        id: params.moveId,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                role: { in: ["owner", "editor"] }
              }
            }
          }
        ]
      }
    });

    if (!move) {
      return new NextResponse("Move not found", { status: 404 });
    }

    // Get current move supply
    const currentMoveSupply = await prisma.moveSupply.findUnique({
      where: {
        moveId_supplyId: {
          moveId: params.moveId,
          supplyId: validatedData.supplyId
        }
      }
    });

    if (!currentMoveSupply) {
      return new NextResponse("Move supply not found", { status: 404 });
    }

    // Calculate quantity difference
    const quantityDiff = validatedData.quantity - currentMoveSupply.quantity;

    // Verify supply exists and has enough quantity if increasing
    const supply = await prisma.supply.findFirst({
      where: {
        id: validatedData.supplyId,
        OR: [
          { userId: session.user.id },
          { companyId: session.user.companyId }
        ],
        isActive: true
      }
    });

    if (!supply) {
      return new NextResponse("Supply not found", { status: 404 });
    }

    if (quantityDiff > 0 && supply.quantityInStock < quantityDiff) {
      return new NextResponse("Not enough supplies in stock", { status: 400 });
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update move supply allocation
      const moveSupply = await tx.moveSupply.update({
        where: {
          moveId_supplyId: {
            moveId: params.moveId,
            supplyId: validatedData.supplyId
          }
        },
        data: {
          quantity: validatedData.quantity
        }
      });

      // Update supply quantity
      await tx.supply.update({
        where: { id: validatedData.supplyId },
        data: {
          quantityInStock: {
            decrement: quantityDiff
          }
        }
      });

      return moveSupply;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[MOVE_SUPPLIES_PATCH]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const supplyId = searchParams.get("supplyId");

    if (!supplyId) {
      return new NextResponse("Supply ID is required", { status: 400 });
    }

    // Verify move exists and belongs to user
    const move = await prisma.move.findFirst({
      where: {
        id: params.moveId,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                role: { in: ["owner", "editor"] }
              }
            }
          }
        ]
      }
    });

    if (!move) {
      return new NextResponse("Move not found", { status: 404 });
    }

    // Get current move supply
    const moveSupply = await prisma.moveSupply.findUnique({
      where: {
        moveId_supplyId: {
          moveId: params.moveId,
          supplyId: supplyId
        }
      }
    });

    if (!moveSupply) {
      return new NextResponse("Move supply not found", { status: 404 });
    }

    // Use a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete move supply allocation
      await tx.moveSupply.delete({
        where: {
          moveId_supplyId: {
            moveId: params.moveId,
            supplyId: supplyId
          }
        }
      });

      // Return quantity to supply stock
      await tx.supply.update({
        where: { id: supplyId },
        data: {
          quantityInStock: {
            increment: moveSupply.quantity
          }
        }
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[MOVE_SUPPLIES_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 