import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper function to serialize dates
const serializeDates = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serializeDates);
  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, serializeDates(value)])
    );
  }
  return obj;
};

// GET /api/users/[userId]/moves - Get all moves for a user
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // Users can only access their own moves or moves they have access to through their company
    const moves = await prisma.move.findMany({
      where: {
        OR: [
          { userId: params.userId },
          {
            company: {
              users: {
                some: { id: session.user.id }
              }
            }
          }
        ]
      },
      include: {
        fromAddress: true,
        toAddress: true,
        stops: {
          include: {
            addressDetails: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        layouts: {
          include: {
            rooms: true
          }
        },
        tasks: {
          include: {
            assignedToUser: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Serialize the data to ensure all dates are properly formatted
    const serializedMoves = serializeDates(moves);

    return NextResponse.json({ 
      success: true, 
      data: serializedMoves 
    });
  } catch (error) {
    console.error('[USER_MOVES_GET]', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
} 