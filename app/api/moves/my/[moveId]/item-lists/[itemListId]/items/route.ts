import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import prisma from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

const itemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  weight: z.number().nullable(),
  isFragile: z.boolean().default(false),
  specialInstructions: z.string().optional().nullable(),
  qrCode: z.string().min(1, 'QR Code is required'),
  originRoomId: z.string().optional().nullable(),
  destinationRoomId: z.string().optional().nullable(),
  category: z.string().default('general'),
})

export async function GET(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const items = await prisma.item.findMany({
      where: {
        itemListId: params.itemListId,
        itemList: {
          moveId: params.moveId,
          move: {
            userId: session.user.id,
          },
        },
      },
      include: {
        qrCodes: true,
        photos: true,
      },
    })

    // Transform the response to match the frontend expectations
    const transformedItems = items.map(item => ({
      ...item,
      qrCode: item.qrCodes[0]?.code || null,
      image: item.photos[0] ? {
        url: item.photos[0].url,
        description: item.photos[0].description,
        mimeType: item.photos[0].mimeType,
        size: item.photos[0].size,
        isPrimary: item.photos[0].isPrimary,
      } : null,
    }))

    return NextResponse.json(transformedItems)
  } catch (error) {
    console.error('Error fetching items:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { moveId: string; itemListId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null
    const isFragile = formData.get('isFragile') === 'true'
    const specialInstructions = formData.get('specialInstructions') as string
    const qrCode = formData.get('qrCode') as string
    const originRoomId = formData.get('originRoomId') as string
    const destinationRoomId = formData.get('destinationRoomId') as string
    const image = formData.get('image') as File | null

    // Validate QR code if provided
    if (qrCode) {
      // Check if QR code is already in use
      const existingQRCode = await prisma.qRCode.findFirst({
        where: {
          code: qrCode,
          OR: [
            { move: { userId: session.user.id } },
            { item: { itemList: { move: { userId: session.user.id } } } }
          ]
        }
      })

      if (existingQRCode) {
        return NextResponse.json(
          { success: false, error: { message: 'This QR code is already in use' } },
          { status: 400 }
        )
      }
    }

    // Create the item
    const item = await prisma.item.create({
      data: {
        name,
        description,
        weight,
        isFragile,
        specialInstructions,
        itemListId: params.itemListId,
        moveId: params.moveId,
        originRoomId: originRoomId || null,
        destinationRoomId: destinationRoomId || null,
      },
      include: {
        originRoom: {
          select: {
            id: true,
            name: true
          }
        },
        destinationRoom: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // If a QR code was provided, create it in a separate transaction
    if (qrCode) {
      try {
        await prisma.qRCode.create({
          data: {
            code: qrCode,
            moveId: params.moveId,
            itemId: item.id,
          },
        })
      } catch (error) {
        console.error('Error creating QR code:', error)
        // Continue even if QR code creation fails
      }
    }

    // If an image was provided, create the photo record
    if (image) {
      try {
        // Convert the file to base64
        const buffer = await image.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        const mimeType = image.type
        const size = image.size

        await prisma.itemPhoto.create({
          data: {
            url: `data:${mimeType};base64,${base64}`,
            description: description || null,
            mimeType,
            size,
            isPrimary: true,
            itemId: item.id,
          },
        })
      } catch (error) {
        console.error('Error creating photo:', error)
        // Continue even if photo creation fails
      }
    }

    // Fetch the complete item with its QR code and photos
    const result = await prisma.item.findUnique({
      where: { id: item.id },
      include: { 
        qrCodes: true,
        photos: true,
      },
    })

    if (!result) {
      throw new Error('Failed to fetch created item')
    }

    // Transform the response to match the frontend expectations
    const transformedItem = {
      ...result,
      qrCode: result.qrCodes?.[0]?.code || null,
      image: result.photos?.[0] ? {
        url: result.photos[0].url,
        description: result.photos[0].description,
        mimeType: result.photos[0].mimeType,
        size: result.photos[0].size,
        isPrimary: result.photos[0].isPrimary,
      } : null,
    }

    return NextResponse.json(transformedItem)
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Failed to create item' } },
      { status: 500 }
    )
  }
}