"use client"

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddVehicleForm } from "./add-vehicle-form"

export function AddVehicleDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] p-0">
        <AddVehicleForm />
      </DialogContent>
    </Dialog>
  )
} 