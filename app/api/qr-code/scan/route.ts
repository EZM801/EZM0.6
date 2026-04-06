import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { qrCode } = await request.json();

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code is required' }, { status: 400 });
    }

    // Find the QR code and its associated item
    const qrCodeRecord = await prisma.qRCode.findFirst({
      where: {
        code: qrCode,
        OR: [
          // Check if user is the move owner
          { move: { userId: session.user.id } },
          // Check if user is a collaborator
          { move: { collaborators: { some: { userId: session.user.id } } } },
          // Check if user is the owner of the item's move
          { item: { itemList: { move: { userId: session.user.id } } } },
          // Check if user is a collaborator of the item's move
          { item: { itemList: { move: { collaborators: { some: { userId: session.user.id } } } } } }
        ]
      },
      include: {
        item: {
          include: {
            itemList: {
              include: {
                move: {
                  include: {
                    collaborators: {
                      select: {
                        userId: true,
                        role: true
                      }
                    }
                  }
                }
              }
            },
            originRoom: true,
            destinationRoom: true,
            photos: {
              where: {
                isPrimary: true
              },
              take: 1
            }
          }
        }
      }
    });

    if (!qrCodeRecord) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    if (!qrCodeRecord.item) {
      return NextResponse.json({ error: 'No item associated with this QR code' }, { status: 404 });
    }

    // Check if user has access to the move
    const move = qrCodeRecord.item.itemList.move;
    const isOwner = move.userId === session.user.id;
    const isCollaborator = move.collaborators.some(c => c.userId === session.user.id);

    if (!isOwner && !isCollaborator) {
      return NextResponse.json({ error: 'Unauthorized access to this item' }, { status: 403 });
    }

    // Return detailed item information
    return NextResponse.json({
      item: {
        id: qrCodeRecord.item.id,
        name: qrCodeRecord.item.name,
        description: qrCodeRecord.item.description,
        weight: qrCodeRecord.item.weight,
        isFragile: qrCodeRecord.item.isFragile,
        specialInstructions: qrCodeRecord.item.specialInstructions,
        packingStatus: qrCodeRecord.item.packingStatus,
        image: qrCodeRecord.item.photos[0] ? {
          url: qrCodeRecord.item.photos[0].url,
          description: qrCodeRecord.item.photos[0].description
        } : null,
        originRoom: qrCodeRecord.item.originRoom ? {
          id: qrCodeRecord.item.originRoom.id,
          name: qrCodeRecord.item.originRoom.name
        } : null,
        destinationRoom: qrCodeRecord.item.destinationRoom ? {
          id: qrCodeRecord.item.destinationRoom.id,
          name: qrCodeRecord.item.destinationRoom.name
        } : null,
        move: {
          id: move.id,
          name: move.name,
          access: isOwner ? 'owner' : 'collaborator'
        }
      }
    });
  } catch (error) {
    console.error('Error scanning QR code:', error);
    return NextResponse.json({ error: 'Failed to scan QR code' }, { status: 500 });
  }
} 