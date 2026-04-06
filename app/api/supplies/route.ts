import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const supplySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  quantityInStock: z.number().min(0, "Quantity must be 0 or greater"),
  reorderPoint: z.number().min(0, "Reorder point must be 0 or greater").default(10),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const supplies = await prisma.supply.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return new Response(JSON.stringify({ success: true, data: supplies }));
  } catch (error) {
    console.error("Error fetching supplies:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to fetch supplies" }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await request.json();
    const validatedData = supplySchema.parse(body);

    const supply = await prisma.supply.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    });

    return new Response(JSON.stringify({ success: true, data: supply }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ success: false, error: error.errors }),
        { status: 400 }
      );
    }
    console.error("Error creating supply:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to create supply" }),
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: "Supply ID is required" }),
        { status: 400 }
      );
    }

    const validatedData = supplySchema.partial().parse(updateData);

    // First find the supply to verify ownership
    const existingSupply = await prisma.supply.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });

    if (!existingSupply) {
      return new Response(
        JSON.stringify({ success: false, error: "Supply not found" }),
        { status: 404 }
      );
    }

    const supply = await prisma.supply.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
    });

    return new Response(JSON.stringify({ success: true, data: supply }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ success: false, error: error.errors }),
        { status: 400 }
      );
    }
    console.error("Error updating supply:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to update supply" }),
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: "Supply ID is required" }),
        { status: 400 }
      );
    }

    // First find the supply to verify ownership
    const existingSupply = await prisma.supply.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });

    if (!existingSupply) {
      return new Response(
        JSON.stringify({ success: false, error: "Supply not found" }),
        { status: 404 }
      );
    }

    await prisma.supply.delete({
      where: { id }
    });

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error("Error deleting supply:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to delete supply" }),
      { status: 500 }
    );
  }
} 