export interface ItemImage {
  url: string;
  description?: string;
  mimeType?: string;
  size?: number;
  isPrimary?: boolean;
}

export interface Room {
  id: string;
  name: string;
  layoutId: string;
}

export interface ItemType {
  id: string;
  itemListId: string;
  name: string;
  description?: string;
  quantity: number;
  image?: ItemImage | null;
  qrCode?: string | null;
  unpacked: boolean;
  createdAt: Date;
  updatedAt: Date;
  originRoomId?: string | null;
  destinationRoomId?: string | null;
  originRoom?: Room | null;
  destinationRoom?: Room | null;
}

export interface CreateItemInput {
  itemListId: string;
  name: string;
  description?: string;
  quantity: number;
  image?: ItemImage;
  qrCode?: string;
  unpacked?: boolean;
}

export interface UpdateItemInput {
  name?: string;
  description?: string;
  quantity?: number;
  image?: ItemImage;
  qrCode?: string;
  unpacked?: boolean;
} 