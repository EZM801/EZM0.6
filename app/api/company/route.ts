import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/lib/auth"
import { Company, User } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.companyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const company = await prisma.company.findUnique({
      where: {
        id: session.user.companyId,
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            userType: true,
            isActive: true,
          },
        },
        moves: {
          include: {
            fromAddress: true,
            toAddress: true,
            itemLists: {
              include: {
                items: true,
              },
            },
          },
        },
      },
    })

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error("[COMPANY_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.companyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { firstName, lastName, email, role, userType } = body

    if (!firstName || !lastName || !email || !role || !userType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const now = new Date()
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        role,
        userType,
        companyId: session.user.companyId,
        password: "", // Will be set by the user on first login
        accountType: "company",
        updatedAt: now,
        createdAt: now,
        isActive: true,
        isVerified: false,
        failedLoginAttempts: 0,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[COMPANY_POST]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 