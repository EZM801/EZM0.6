import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/company/moves/[moveId]/rooms - List all rooms for a company move
export async function GET(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.userType !== 'COMPANY') {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const moveId = params.moveId;
    
    // First verify the move belongs to the company
    const companyMove = await prisma.companyMove.findFirst({
      where: { 
        id: moveId,
        companyId: session.user.companyId
      }
    });

    if (!companyMove) {
      return NextResponse.json(
        { success: false, error: { message: "Move not found" } },
        { status: 404 }
      );
    }
    
    // Get all layouts for the move
    const layouts = await prisma.companyMoveLayout.findMany({
      where: { moveId },
      include: { rooms: true }
    });
    
    // Extract all rooms from all layouts
    const rooms = layouts.flatMap(layout => layout.rooms.map(room => ({
      ...room,
      layoutName: layout.name,
      layoutOrientation: layout.orientation
    })));

    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal Server Error" } },
      { status: 500 }
    );
  }
} 