import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { CreateAddressInput } from '@/app/types/AddressType';

// GET /api/addresses - Get all addresses for the current user's moves
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: {
        OR: [
          { fromMoves: { some: { user: { email: session.user.email } } } },
          { toMoves: { some: { user: { email: session.user.email } } } },
          { moveStops: { some: { move: { user: { email: session.user.email } } } } }
        ]
      },
      include: {
        fromMoves: true,
        toMoves: true,
        moveStops: true
      }
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST /api/addresses - Create a new address
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateAddressInput = await request.json();
    
    const address = await prisma.address.create({
      data: body
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
} 