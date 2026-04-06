import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        company: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return the user data in the expected structure
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        role: user.role,
        isActive: user.isActive,
        companyId: user.companyId,
        company: user.company
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Forward the POST request to /api/users
  const response = await fetch(new URL("/api/users", request.url), {
    method: "POST",
    body: await request.text(),
    headers: request.headers,
  });
  return response;
}

export async function PUT(request: Request) {
  // Forward the PUT request to /api/users
  const response = await fetch(new URL("/api/users", request.url), {
    method: "PUT",
    body: await request.text(),
    headers: request.headers,
  });
  return response;
}

export async function DELETE(request: Request) {
  // Forward the DELETE request to /api/users
  const response = await fetch(new URL("/api/users", request.url), {
    method: "DELETE",
    headers: request.headers,
  });
  return response;
} 