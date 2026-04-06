import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import prisma from '@/app/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const itemList = await prisma.itemList.findFirst({
      where: {
        id: params.itemListId,
        moveId: params.moveId,
        move: {
          userId: session.user.id,
        },
      },
      include: {
        items: {
          include: {
            photos: true,
            qrCodes: true,
          },
        },
      },
    })

    if (!itemList) {
      return new NextResponse('Item list not found', { status: 404 })
    }

    // Transform the response to match the frontend expectations
    const transformedItemList = {
      ...itemList,
      items: itemList.items.map(item => ({
        ...item,
        image: item.photos[0] ? {
          url: item.photos[0].url,
          description: item.photos[0].description,
          mimeType: item.photos[0].mimeType,
          size: item.photos[0].size,
          isPrimary: item.photos[0].isPrimary,
        } : null,
        qrCode: item.qrCodes[0]?.code || null,
      })),
    }

    return NextResponse.json({
      success: true,
      data: transformedItemList,
    })
  } catch (error) {
    console.error('Error fetching item list:', error)
    return new NextResponse(JSON.stringify({
      success: false,
      error: { message: 'Internal Server Error' }
    }), { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const json = await request.json()
    const { name, description } = json

    // Verify item list belongs to user's move
    const existingItemList = await prisma.itemList.findFirst({
      where: {
        id: params.itemListId,
        moveId: params.moveId,
        move: {
          userId: session.user.id,
        },
      },
    })

    if (!existingItemList) {
      return new NextResponse('Item list not found', { status: 404 })
    }

    const itemList = await prisma.itemList.update({
      where: {
        id: params.itemListId,
      },
      data: {
        name,
        description,
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(itemList)
  } catch (error) {
    console.error('Error updating item list:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify item list belongs to user's move
    const existingItemList = await prisma.itemList.findFirst({
      where: {
        id: params.itemListId,
        moveId: params.moveId,
        move: {
          userId: session.user.id,
        },
      },
    })

    if (!existingItemList) {
      return new NextResponse('Item list not found', { status: 404 })
    }

    await prisma.itemList.delete({
      where: {
        id: params.itemListId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting item list:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 