import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { UpdateAddressInput } from '@/app/types/AddressType';

// GET /api/addresses/[addressId] - Get a specific address
export async function GET(
  request: Request,
  { params }: { params: { addressId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const address = await prisma.address.findFirst({
      where: {
        id: params.addressId,
      },
    });

    if (!address) {
      return new NextResponse('Address not found', { status: 404 });
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error('[ADDRESS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT /api/addresses/[addressId] - Update an address
export async function PUT(
  request: Request,
  { params }: { params: { addressId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await request.json();
    const { street, city, state, zipCode, country, hasElevator, floorNumber, specialInstructions } = json;

    const address = await prisma.address.update({
      where: {
        id: params.addressId,
      },
      data: {
        street,
        city,
        state,
        zipCode,
        country,
        hasElevator,
        floorNumber,
        specialInstructions,
      },
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error('[ADDRESS_PUT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/addresses/[addressId] - Delete an address
export async function DELETE(
  request: Request,
  { params }: { params: { addressId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.address.delete({
      where: {
        id: params.addressId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ADDRESS_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 