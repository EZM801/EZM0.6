import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { v4 as uuidv4 } from "uuid";

const companySupplySchema = z.object({
  name: z.string().max(255, "Name must be less than 255 characters"),
  type: z.string().max(100, "Type must be less than 100 characters").optional(),
  quantity: z.number().int().min(0, "Quantity must be a positive number").optional(),
  unit: z.string().max(50, "Unit must be less than 50 characters").optional(),
  minQuantity: z.number().int().min(0, "Minimum quantity must be a positive number").optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }

    const supplies = await prisma.supply.findMany({
      where: { companyId: session.user.companyId },
      include: { moves: true },
    });

    return NextResponse.json({ success: true, data: supplies });
  } catch (error) {
    console.error("Error fetching supplies:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch supplies", code: "FETCH_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = companySupplySchema.parse(body);

    const data = {
      id: uuidv4(),
      companyId: session.user.companyId,
      name: validatedData.name,
      type: validatedData.type,
      quantity: validatedData.quantity,
      unit: validatedData.unit,
      minQuantity: validatedData.minQuantity,
    };

    const supply = await prisma.supply.create({
      data,
      include: { moves: true },
    });

    return NextResponse.json({ success: true, data: supply });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: "Validation error", code: "VALIDATION_ERROR", details: error.errors } },
        { status: 400 }
      );
    }

    console.error("Error creating supply:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create supply", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: "Supply ID is required", code: "MISSING_ID" } },
        { status: 400 }
      );
    }

    const validatedData = companySupplySchema.partial().parse(updateData);

    const supply = await prisma.supply.findFirst({
      where: { id, companyId: session.user.companyId },
    });

    if (!supply) {
      return NextResponse.json(
        { success: false, error: { message: "Supply not found", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    const updatedSupply = await prisma.supply.update({
      where: { id },
      data: validatedData,
      include: { moves: true },
    });

    return NextResponse.json({ success: true, data: updatedSupply });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: "Validation error", code: "VALIDATION_ERROR", details: error.errors } },
        { status: 400 }
      );
    }

    console.error("Error updating supply:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update supply", code: "UPDATE_ERROR" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: "Supply ID is required", code: "MISSING_ID" } },
        { status: 400 }
      );
    }

    const supply = await prisma.supply.findFirst({
      where: { id, companyId: session.user.companyId },
    });

    if (!supply) {
      return NextResponse.json(
        { success: false, error: { message: "Supply not found", code: "NOT_FOUND" } },
        { status: 404 }
      );
    }

    await prisma.supply.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting supply:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete supply", code: "DELETE_ERROR" } },
      { status: 500 }
    );
  }
} 