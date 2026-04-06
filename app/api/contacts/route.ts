import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Validation schema for contact creation
const createContactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  type: z.enum(["personal", "business", "emergency"]),
  notes: z.string().optional(),
  moveId: z.string().uuid("Invalid move ID").optional(),
  companyId: z.string().uuid("Invalid company ID").optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string()
  }).optional()
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const moveId = searchParams.get("moveId");
    const type = searchParams.get("type");
    const companyId = searchParams.get("companyId");

    const contacts = await prisma.Contact.findMany({
      where: {
        userId: session.user.id,
        ...(moveId && { moveId }),
        ...(type && { type }),
        ...(companyId && { companyId })
      },
      include: {
        move: true,
        company: true,
        address: true
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createContactSchema.parse(body);

    // Verify move access if moveId is provided
    if (validatedData.moveId) {
      const move = await prisma.Move.findFirst({
        where: {
          id: validatedData.moveId,
          OR: [
            { userId: session.user.id },
            { company: { users: { some: { id: session.user.id } } } }
          ]
        }
      });

      if (!move) {
        return NextResponse.json(
          { error: 'Move not found or access denied' },
          { status: 403 }
        );
      }
    }

    // Verify company access if companyId is provided
    if (validatedData.companyId) {
      const company = await prisma.companies.findFirst({
        where: {
          id: validatedData.companyId,
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      });

      if (!company) {
        return NextResponse.json(
          { error: 'Company not found or access denied' },
          { status: 403 }
        );
      }
    }

    // Create address if provided
    let addressId;
    if (validatedData.address) {
      const address = await prisma.Address.create({
        data: {
          id: uuidv4(),
          ...validatedData.address
        }
      });
      addressId = address.id;
    }

    // Create contact
    const contact = await prisma.Contact.create({
      data: {
        id: uuidv4(),
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber || "",
        type: validatedData.type,
        notes: validatedData.notes,
        userId: session.user.id,
        moveId: validatedData.moveId,
        companyId: validatedData.companyId,
        addressId
      },
      include: {
        move: true,
        company: true,
        address: true
      }
    });

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      error instanceof z.ZodError 
        ? { errors: error.errors }
        : { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}

// Add PATCH endpoint for updating contact
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contactId, firstName, lastName, email, phoneNumber, type, notes, address } = body;

    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    // Verify contact access
    const contact = await prisma.Contact.findFirst({
      where: {
        id: contactId,
        userId: session.user.id
      }
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found or access denied' },
        { status: 403 }
      );
    }

    // Update address if provided
    let addressId = contact.addressId;
    if (address) {
      const updatedAddress = await prisma.Address.update({
        where: { id: contact.addressId || uuidv4() },
        data: address
      });
      addressId = updatedAddress.id;
    }

    // Update contact
    const updatedContact = await prisma.Contact.update({
      where: { id: contactId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(phoneNumber && { phoneNumber }),
        ...(type && { type }),
        ...(notes && { notes }),
        ...(addressId && { addressId }),
        userId: session.user.id
      },
      include: {
        move: true,
        company: true,
        address: true
      }
    });

    return NextResponse.json({ contact: updatedContact });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("contactId");

    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    // Verify contact access
    const contact = await prisma.Contact.findFirst({
      where: {
        id: contactId,
        userId: session.user.id
      }
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found or access denied' },
        { status: 403 }
      );
    }

    // Delete contact
    const deletedContact = await prisma.Contact.delete({
      where: { id: contactId }
    });

    return NextResponse.json({ contact: deletedContact });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
} 