"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { EditMoveModal } from "./modals/EditMoveModal"
import { CompanyMove } from "@prisma/client"

interface MoveHeaderProps {
  move: CompanyMove
}

export function MoveHeader({ move }: MoveHeaderProps) {
  const [showEditModal, setShowEditModal] = useState(false)

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">{move.name}</h1>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setShowEditModal(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Move
        </Button>
      </div>

      <EditMoveModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        move={move}
      />
    </div>
  )
} 