import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout, Room, CreateLayoutRequest, CreateRoomRequest } from '@/app/types/LayoutType';

async function fetchLayouts(moveId: string): Promise<Layout[]> {
  const response = await fetch(`/api/moves/${moveId}/layouts?include=rooms`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch layouts');
  }
  const { data } = await response.json();
  return data.map((layout: any) => ({
    id: layout.id,
    name: layout.name,
    instructions: layout.instructions || undefined,
    moveId: layout.moveId || "",
    moveStopId: layout.moveStopId || undefined,
    orientation: layout.orientation,
    createdAt: layout.createdAt,
    updatedAt: layout.updatedAt,
    rooms: layout.rooms || []
  }));
}

async function fetchLayout(moveId: string, layoutId: string): Promise<Layout> {
  const response = await fetch(`/api/moves/${moveId}/layouts/${layoutId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch layout');
  }
  const { data } = await response.json();
  return {
    id: data.id,
    name: data.name,
    instructions: data.instructions || undefined,
    moveId: data.moveId || "",
    moveStopId: data.moveStopId || undefined,
    orientation: data.orientation,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    rooms: data.rooms || []
  };
}

async function createLayout(moveId: string, data: CreateLayoutRequest): Promise<Layout> {
  const response = await fetch(`/api/moves/${moveId}/layouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create layout');
  }
  const { data: layout } = await response.json();
  return {
    id: layout.id,
    name: layout.name,
    instructions: layout.instructions || undefined,
    moveId: layout.moveId || "",
    moveStopId: layout.moveStopId || undefined,
    orientation: layout.orientation,
    createdAt: layout.createdAt,
    updatedAt: layout.updatedAt,
    rooms: []
  };
}

async function fetchRooms(moveId: string, layoutId: string): Promise<Room[]> {
  const response = await fetch(`/api/moves/${moveId}/layouts/${layoutId}/rooms`);
  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }
  return response.json();
}

async function createRoom(moveId: string, layoutId: string, data: CreateRoomRequest): Promise<Room> {
  const response = await fetch(`/api/moves/${moveId}/layouts/${layoutId}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create room');
  }
  return response.json();
}

export function useLayouts(moveId: string, isCompany: boolean = false) {
  return useQuery({
    queryKey: ["layouts", moveId, isCompany],
    queryFn: async () => {
      // Check if we're in a company context based on the URL path
      const isCompanyPath = window.location.pathname.includes('/company/');
      const apiPath = isCompanyPath ? `/api/company/moves/${moveId}/layouts` : `/api/moves/${moveId}/layouts`;
      
      console.log('Using API path:', apiPath);
      const response = await fetch(`${apiPath}?include=rooms`)
      if (!response.ok) {
        throw new Error("Failed to fetch layouts")
      }
      const result = await response.json()
      console.log('Layouts API response:', result)
      return result.data || []
    },
    enabled: !!moveId,
  })
}

export function useLayout(moveId: string, layoutId: string) {
  return useQuery({
    queryKey: ['layout', moveId, layoutId],
    queryFn: () => fetchLayout(moveId, layoutId),
    enabled: !!moveId && !!layoutId,
  });
}

export function useCreateLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ moveId, data }: { moveId: string; data: CreateLayoutRequest }) =>
      createLayout(moveId, data),
    onSuccess: (_, { moveId }) => {
      queryClient.invalidateQueries({ queryKey: ['layouts', moveId] });
    },
  });
}

export function useRooms(moveId: string) {
  return useQuery({
    queryKey: ["rooms", moveId],
    queryFn: async () => {
      const response = await fetch(`/api/moves/${moveId}/rooms`)
      if (!response.ok) {
        throw new Error("Failed to fetch rooms")
      }
      const data = await response.json()
      return data.data || []
    },
    enabled: !!moveId,
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ moveId, layoutId, data }: { moveId: string; layoutId: string; data: CreateRoomRequest }) =>
      createRoom(moveId, layoutId, data),
    onSuccess: (_, { moveId, layoutId }) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', moveId, layoutId] });
    },
  });
} 