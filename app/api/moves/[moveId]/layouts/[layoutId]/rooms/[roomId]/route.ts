import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { UpdateRoomRequest } from '@/app/types/LayoutType';

interface RouteParams {
  params: {
    moveId: string;
    layoutId: string;
    roomId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const room = await prisma.room.findFirst({
      where: {
        id: params.roomId,
        layoutId: params.layoutId,
        layout: {
          moveId: params.moveId,
          move: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!room) {
      return new NextResponse("Room not found", { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("[ROOM_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify room belongs to user's move
    const existingRoom = await prisma.room.findFirst({
      where: {
        id: params.roomId,
        layoutId: params.layoutId,
        layout: {
          moveId: params.moveId,
          move: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!existingRoom) {
      return new NextResponse("Room not found", { status: 404 });
    }

    const json = await request.json();
    const { name, width, height, x, y } = json as UpdateRoomRequest;

    const room = await prisma.room.update({
      where: {
        id: params.roomId,
      },
      data: {
        name,
        width,
        height,
        x,
        y,
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("[ROOM_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const moveId = await params.moveId;
    const layoutId = await params.layoutId;
    const roomId = await params.roomId;

    // Verify room belongs to user's move
    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        layoutId,
        moveId,
        move: {
          OR: [
            { userId: session.user.id },
            { company: { users: { some: { id: session.user.id } } } }
          ]
        }
      }
    });

    if (!room) {
      return new Response("Room not found or access denied", { status: 404 });
    }

    // Delete the room
    await prisma.room.delete({
      where: { id: roomId }
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[ROOM_DELETE]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
} 