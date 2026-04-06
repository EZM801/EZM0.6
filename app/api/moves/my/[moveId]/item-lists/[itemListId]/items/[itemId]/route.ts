import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Item, ItemPhoto } from '@prisma/client'

type ItemWithPhoto = Item & {
  photos: ItemPhoto[]
  originRoom: {
    id: string
    name: string
  } | null
  destinationRoom: {
    id: string
    name: string
  } | null
}

export async function GET(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const item = await prisma.item.findFirst({
      where: {
        id: params.itemId,
        itemListId: params.itemListId,
        itemList: {
          moveId: params.moveId,
          move: {
            userId: session.user.id,
          },
        },
      },
      include: {
        photos: true,
        originRoom: true,
        destinationRoom: true,
      },
    }) as ItemWithPhoto | null

    if (!item) {
      return new NextResponse('Item not found', { status: 404 })
    }

    // Transform response to match frontend expectations
    const response = {
      ...item,
      image: item.photos?.[0] ? {
        url: item.photos[0].url,
        description: item.photos[0].description,
        mimeType: item.photos[0].mimeType,
        size: item.photos[0].size,
        isPrimary: item.photos[0].isPrimary,
      } : null,
      originRoom: item.originRoom ? {
        id: item.originRoom.id,
        name: item.originRoom.name,
      } : null,
      destinationRoom: item.destinationRoom ? {
        id: item.destinationRoom.id,
        name: item.destinationRoom.name,
      } : null,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching item:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const json = await request.json()
    const { 
      name, 
      description, 
      weight, 
      specialInstructions,
      image,
      isFragile,
      category,
    } = json

    // Verify item belongs to user's move
    const existingItem = await prisma.item.findFirst({
      where: {
        id: params.itemId,
        itemListId: params.itemListId,
        itemList: {
          moveId: params.moveId,
          move: {
            userId: session.user.id,
          },
        },
      },
    })

    if (!existingItem) {
      return new NextResponse('Item not found', { status: 404 })
    }

    // Update the item and handle image in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the item
      const item = await tx.item.update({
        where: {
          id: params.itemId,
        },
        data: {
          name,
          description,
          weight,
          specialInstructions,
          isFragile,
          category,
        },
      })

      // If an image was provided, update or create the photo record
      if (image?.url) {
        // Delete existing photos if any
        await tx.itemPhoto.deleteMany({
          where: {
            itemId: params.itemId,
          },
        })

        // Create new photo record
        await tx.itemPhoto.create({
          data: {
            url: image.url,
            description: image.description || null,
            mimeType: image.mimeType || 'image/jpeg',
            size: image.size || 0,
            isPrimary: true,
            itemId: params.itemId,
          },
        })
      }

      // Fetch the complete item with its photos
      const itemWithPhotos = await tx.item.findUnique({
        where: { id: params.itemId },
        include: {
          photos: true,
        },
      }) as ItemWithPhoto | null

      if (!itemWithPhotos) {
        throw new Error('Failed to fetch item with photos')
      }

      return itemWithPhotos
    })

    // Transform the response to match frontend expectations
    const response = {
      ...result,
      image: result.photos?.[0] ? {
        url: result.photos[0].url,
        description: result.photos[0].description,
        mimeType: result.photos[0].mimeType,
        size: result.photos[0].size,
        isPrimary: result.photos[0].isPrimary,
      } : null,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating item:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify item belongs to user's move
    const existingItem = await prisma.item.findFirst({
      where: {
        id: params.itemId,
        itemListId: params.itemListId,
        itemList: {
          moveId: params.moveId,
          move: {
            userId: session.user.id,
          },
        },
      },
    })

    if (!existingItem) {
      return new NextResponse('Item not found', { status: 404 })
    }

    // Delete the item (this will cascade delete photos due to onDelete: Cascade)
    await prisma.item.delete({
      where: {
        id: params.itemId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting item:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 