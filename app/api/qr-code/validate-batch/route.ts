import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { codes } = body

    if (!Array.isArray(codes)) {
      return NextResponse.json(
        { error: "Invalid input format" },
        { status: 400 }
      )
    }

    // Check all codes in a single query
    const existingCodes = await prisma.qRCode.findMany({
      where: {
        code: {
          in: codes
        }
      },
      select: {
        code: true,
        status: true,
        isPrePrinted: true
      }
    })

    // Create a map for easy lookup
    const codeMap = existingCodes.reduce((acc, code) => {
      acc[code.code] = code
      return acc
    }, {} as Record<string, any>)

    // Validate each code
    const results = codes.map(code => ({
      code,
      isValid: !!(codeMap[code] && codeMap[code].isPrePrinted && codeMap[code].status === "inactive"),
      reason: codeMap[code] 
        ? codeMap[code].status === "active"
          ? "Code already in use"
          : !codeMap[code].isPrePrinted
            ? "Not a valid item code"
            : undefined
        : "Code not found"
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Batch validation error:", error)
    return NextResponse.json(
      { error: "Failed to validate QR codes" },
      { status: 500 }
    )
  }
} 