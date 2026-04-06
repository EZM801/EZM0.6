import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import prisma from '@/app/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    console.log('Fetching move with params:', params);
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('No authenticated user found');
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    console.log('Authenticated user:', session.user.id);
    const move = await prisma.move.findFirst({
      where: {
        id: params.moveId,
        OR: [
          { userId: session.user.id },
          { company: { users: { some: { id: session.user.id } } } }
        ]
      },
      include: {
        fromAddress: true,
        toAddress: true,
        stops: {
          include: {
            addressDetails: true,
          },
        },
        itemLists: {
          include: {
            items: {
              include: {
                photos: {
                  where: { isPrimary: true },
                  take: 1
                },
                qrCodes: {
                  take: 1
                }
              }
            }
          }
        },
        layouts: {
          include: {
            rooms: true,
          },
        },
      },
    })

    console.log('Found move:', move ? 'yes' : 'no');
    if (!move) {
      console.log('Move not found for ID:', params.moveId);
      return NextResponse.json(
        { success: false, error: { message: 'Move not found' } },
        { status: 404 }
      )
    }

    console.log('Returning move data');
    return NextResponse.json({ success: true, data: move })
  } catch (error) {
    console.error('Error fetching move:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal Server Error' } },
      { status: 500 }
    )
  }
} 