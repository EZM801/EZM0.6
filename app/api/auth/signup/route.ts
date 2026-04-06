import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/app/lib/prisma"
import { v4 as uuidv4 } from 'uuid'

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  userType: z.enum(["individual", "company"]),
  companyName: z.string().optional(),
  companyCode: z.string().optional(),
}).refine(
  (data) => {
    if (data.userType === "company") {
      return data.companyName && data.companyCode
    }
    return true
  },
  {
    message: "Company name and code are required for company accounts",
    path: ["companyName"],
  }
)

type SignupResult = {
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    userType: string
    role: string | null
    isActive: boolean
  }
  company?: {
    id: string
    name: string
    companyCode: string
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Received signup request:", body)
    
    const validatedData = signupSchema.parse(body)
    console.log("Validated data:", validatedData)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 10)

    // Prepare user data
    const userData = {
      id: uuidv4(),
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      userType: validatedData.userType.toUpperCase(),
      role: validatedData.userType === "company" ? "admin" : "user",
      isActive: true,
      isVerified: false,
      failedLoginAttempts: 0,
      lastLoginAttempt: null,
      emailVerified: null,
      updatedAt: new Date(),
    }

    let result: SignupResult;

    if (validatedData.userType === "company") {
      // We can safely assert these types because of the schema refinement
      const companyName = validatedData.companyName as string
      const companyCode = validatedData.companyCode as string

      // Check if company code or name is already taken
      const existingCompany = await prisma.company.findFirst({
        where: { 
          OR: [
            { companyCode },
            { name: companyName }
          ]
        }
      })

      if (existingCompany) {
        if (existingCompany.companyCode === companyCode) {
          return NextResponse.json(
            { error: "Company code is already taken" },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { error: "Company name is already taken" },
          { status: 400 }
        )
      }

      // Create company and user in a transaction
      const transactionResult = await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: {
            id: uuidv4(),
            name: companyName,
            companyCode: companyCode,
            isActive: true,
          }
        })

        const user = await tx.user.create({
          data: {
            ...userData,
            companyId: company.id,
            companyCode: companyCode,
          }
        })

        return { user, company }
      })

      result = {
        user: {
          id: transactionResult.user.id,
          email: transactionResult.user.email,
          firstName: transactionResult.user.firstName,
          lastName: transactionResult.user.lastName,
          userType: transactionResult.user.userType,
          role: transactionResult.user.role,
          isActive: transactionResult.user.isActive,
        },
        company: {
          id: transactionResult.company.id,
          name: transactionResult.company.name,
          companyCode: transactionResult.company.companyCode,
        }
      }
    } else {
      // Create individual user
      const user = await prisma.user.create({
        data: userData
      })

      result = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          role: user.role,
          isActive: user.isActive,
        }
      }
    }

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error("Signup error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
} 