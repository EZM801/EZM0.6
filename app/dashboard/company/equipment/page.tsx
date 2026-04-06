import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EquipmentList } from "@/components/equipment-list"

export default async function EquipmentPage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/login")
  }

  // Fetch equipment data
  const equipment = await prisma.equipment.findMany({
    where: {
      companyId: session.user.companyId,
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Equipment Management</h1>
          <p className="text-muted-foreground">Manage your company's equipment inventory</p>
        </div>
      </div>

      <EquipmentList equipment={equipment} />
    </div>
  )
} 