"use client"

import { useRouter } from "next/navigation"
import { CompanyMoveList } from "@/app/dashboard/company/moves/components/company-move-list"
import { CreateMoveButton } from "@/app/dashboard/company/moves/components/create-move-button"

export default function CompanyMovesPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Moves</h1>
          <p className="text-muted-foreground">
            Manage and track all company moves
          </p>
        </div>
        <CreateMoveButton />
      </div>
      <CompanyMoveList />
    </div>
  )
} 