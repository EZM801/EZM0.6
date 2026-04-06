import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import prisma from '@/app/lib/prisma'
import { moveCollaboratorSchema } from '@/app/lib/validations/schemas'
import { z } from 'zod'

// GET /api/moves/[moveId]/collaborators - Get all collaborators for a move
export async function GET(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify user has access to the move
    const move = await prisma.move.findFirst({
      where: {
        id: params.moveId,
        OR: [
          { userId: session.user.id },
          { collaborators: { some: { userId: session.user.id } } }
        ]
      }
    })

    if (!move) {
      return new NextResponse('Move not found or access denied', { status: 404 })
    }

    const collaborators = await prisma.moveCollaborator.findMany({
      where: {
        moveId: params.moveId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json(collaborators)
  } catch (error) {
    console.error('Error fetching collaborators:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// POST /api/moves/[moveId]/collaborators - Add a collaborator to a move
export async function POST(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify user is the move owner
    const move = await prisma.move.findFirst({
      where: {
        id: params.moveId,
        userId: session.user.id
      }
    })

    if (!move) {
      return new NextResponse('Move not found or access denied', { status: 404 })
    }

    const body = await request.json()
    const validatedData = moveCollaboratorSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId }
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Add collaborator
    const collaborator = await prisma.moveCollaborator.create({
      data: {
        moveId: params.moveId,
        userId: validatedData.userId,
        role: validatedData.role
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json(collaborator, { status: 201 })
  } catch (error) {
    console.error('Error adding collaborator:', error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// DELETE /api/moves/[moveId]/collaborators - Remove a collaborator from a move
export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify user is the move owner
    const move = await prisma.move.findFirst({
      where: {
        id: params.moveId,
        userId: session.user.id
      }
    })

    if (!move) {
      return new NextResponse('Move not found or access denied', { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 })
    }

    // Remove collaborator
    await prisma.moveCollaborator.delete({
      where: {
        moveId_userId: {
          moveId: params.moveId,
          userId
        }
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error removing collaborator:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 