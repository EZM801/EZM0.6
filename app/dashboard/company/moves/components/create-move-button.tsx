"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateMoveForm } from "./create-move-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function CreateMoveButton() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Move
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Move</DialogTitle>
        </DialogHeader>
        <CreateMoveForm 
          onSuccess={() => {
            setIsOpen(false)
            router.refresh()
          }} 
        />
      </DialogContent>
    </Dialog>
  )
} 