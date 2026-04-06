import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

// GET /api/companies/[companyId] - Get a specific company
export async function GET(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const company = await prisma.company.findFirst({
      where: {
        id: params.companyId,
        users: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!company) {
      return new NextResponse('Company not found', { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('[COMPANY_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT /api/companies/[companyId] - Update a company
export async function PUT(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await request.json();
    const { name, description } = json;

    const company = await prisma.company.update({
      where: {
        id: params.companyId,
        users: {
          some: {
            userId: session.user.id,
          },
        },
      },
      data: {
        name,
        description,
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('[COMPANY_PUT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/companies/[companyId] - Delete a company
export async function DELETE(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.company.delete({
      where: {
        id: params.companyId,
        users: {
          some: {
            userId: session.user.id,
          },
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[COMPANY_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 