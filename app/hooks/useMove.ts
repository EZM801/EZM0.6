import { useQuery } from '@tanstack/react-query';
import { Move, MoveType, ItemList } from '@/app/types/MoveType';

interface MoveStop {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  addressDetails: {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    hasElevator: boolean;
    floorNumber: number | null;
    specialInstructions: string | null;
  } | null;
  arrivalDate: string | null;
  departureDate: string | null;
  notes: string | null;
}

async function fetchMove(id: string): Promise<Move> {
  console.log('Fetching move with ID:', id);
  const response = await fetch(`/api/company/moves/${id}`);
  console.log('Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error('Failed to fetch move');
  }
  
  const result = await response.json();
  console.log('Response data:', JSON.stringify(result, null, 2));
  
  if (!result.success || !result.data) {
    console.error('Invalid response format:', result);
    throw new Error(result.error?.message || 'Failed to fetch move');
  }

  const data = result.data;
  console.log('Transforming move data:', JSON.stringify(data, null, 2));
  
  try {
    // Transform the data to match the Move type
    const transformedMove: Move = {
      id: data.id,
      name: data.name,
      description: data.description || null,
      status: data.status,
      moveType: data.moveType ? (data.moveType.toLowerCase() as MoveType) : null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      userId: data.createdById,
      companyId: data.companyId || null,
      isTemplate: false,
      templateName: null,
      templateCategory: null,
      visibility: 'private',
      fromAddressId: data.fromAddressId || null,
      toAddressId: data.toAddressId || null,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      fromAddress: data.fromAddress ? {
        ...data.fromAddress,
        floorNumber: data.fromAddress.floorNumber || null,
        specialInstructions: data.fromAddress.specialInstructions || null,
        createdAt: new Date(data.fromAddress.createdAt),
        updatedAt: new Date(data.fromAddress.updatedAt),
      } : null,
      toAddress: data.toAddress ? {
        ...data.toAddress,
        floorNumber: data.toAddress.floorNumber || null,
        specialInstructions: data.toAddress.specialInstructions || null,
        createdAt: new Date(data.toAddress.createdAt),
        updatedAt: new Date(data.toAddress.updatedAt),
      } : null,
      stops: [],
      layouts: data.layouts?.map((layout: any) => ({
        id: layout.id,
        name: layout.name,
        instructions: layout.instructions || null,
        moveId: layout.moveId,
        moveStopId: null,
        orientation: layout.orientation,
        createdAt: new Date(layout.createdAt),
        updatedAt: new Date(layout.updatedAt),
        rooms: layout.rooms?.map((room: any) => ({
          id: room.id,
          name: room.name,
          description: room.description || null,
          layoutId: room.layoutId,
          createdAt: new Date(room.createdAt),
          updatedAt: new Date(room.updatedAt),
          originItems: room.originItems || [],
          destinationItems: room.destinationItems || [],
          stopItems: room.stopItems || []
        })) || []
      })) || [],
      itemLists: data.itemLists?.map((list: any) => ({
        id: list.id,
        name: list.name,
        description: list.description || null,
        items: list.items?.map((item: any) => ({
          ...item,
          description: item.description || null,
          photos: [],
          qrCodes: []
        })) || []
      })) || []
    };

    console.log('Transformed move:', JSON.stringify(transformedMove, null, 2));
    return transformedMove;
  } catch (error) {
    console.error('Error transforming move data:', error);
    throw new Error('Failed to transform move data');
  }
}

export function useMove(id: string) {
  return useQuery<Move, Error>({
    queryKey: ['move', id],
    queryFn: () => fetchMove(id),
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 