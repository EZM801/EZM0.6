import { Layout as PrismaLayoutType, Room as PrismaRoom } from "@prisma/client";

export interface Room {
  id: string;
  name: string;
  instructions: string | null;
  layoutId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Layout {
  id: string;
  name: string;
  instructions: string | null;
  moveId: string | null;
  moveStopId: string | null;
  orientation: string;
  rooms: Room[];
  createdAt: Date;
  updatedAt: Date;
}

export type PrismaLayout = PrismaLayoutType; 