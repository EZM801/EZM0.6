"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/supplies-columns"
import { AddSupplyDialog } from "./components/add-supply-dialog"

async function fetchCompanySupplies() {
  const response = await fetch("/api/company/supplies")
  if (!response.ok) throw new Error("Failed to fetch company supplies")
  const data = await response.json()
  return data
}

export default function CompanySuppliesPage() {
  const { data: suppliesData, isLoading: isLoadingSupplies } = useQuery({
    queryKey: ["company-supplies"],
    queryFn: fetchCompanySupplies
  })

  const supplies = suppliesData?.data || []

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Company Supplies</h1>
        <AddSupplyDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supply Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={supplies}
            isLoading={isLoadingSupplies}
          />
        </CardContent>
      </Card>
    </div>
  )
} 