import { ItemType } from './ItemType';

export interface ItemListType {
  id: string;
  moveId: string;
  name: string;
  description?: string;
  items: ItemType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateItemListInput {
  name: string;
  description?: string | null;
  moveId: string;
}

export interface UpdateItemListInput {
  name?: string;
  description?: string;
} 