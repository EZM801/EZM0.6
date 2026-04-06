export interface Supply {
  id: string
  name: string
  description: string | null
  category: string
  unit: string
  quantityInStock: number
  reorderPoint: number
  companyId: string | null
  isActive: boolean
  userId: string | null
  createdAt: string
  updatedAt: string
}

export interface MoveSupply {
  moveId: string
  supplyId: string
  quantity: number
  assignedAt: string
  supply?: Supply
} 