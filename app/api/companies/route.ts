import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { z } from "zod"
import { v4 as uuidv4 } from 'uuid'
import { CreateCompanyInput, UpdateCompanyInput } from '@/app/types/CompanyType'

// Validation schema for company creation
const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  businessType: z.string().optional(),
  companyCode: z.string().optional()
})

// GET /api/company - Get current user's company
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        company: true
      }
    })

    if (!user?.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json(user.company)
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}

// POST /api/company - Create a new company
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateCompanyInput = await request.json()

    // Check if user already has a company
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        company: true
      }
    })

    if (user?.company) {
      return NextResponse.json(
        { error: 'User already has a company' },
        { status: 400 }
      )
    }

    // Create company and update user
    const company = await prisma.company.create({
      data: body
    })

    await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: {
        companyId: company.id
      }
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}

// PUT /api/company - Update company
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: UpdateCompanyInput = await request.json()

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        company: true
      }
    })

    if (!user?.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const company = await prisma.company.update({
      where: {
        id: user.company.id
      },
      data: body
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    )
  }
}

// DELETE /api/company - Delete company
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        company: true
      }
    })

    if (!user?.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // First, update all users to remove company association
    await prisma.user.updateMany({
      where: {
        companyId: user.company.id
      },
      data: {
        companyId: null
      }
    })

    // Then delete the company
    await prisma.company.delete({
      where: {
        id: user.company.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    )
  }
}
