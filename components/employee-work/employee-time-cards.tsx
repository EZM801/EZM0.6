"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface EmployeeTimeCardsProps {
  employeeId: string
}

export function EmployeeTimeCards({ employeeId }: EmployeeTimeCardsProps) {
  const { data: timeCards, isLoading } = useQuery({
    queryKey: ["employee-time-cards", employeeId],
    queryFn: async () => {
      const response = await fetch(`/api/employees/${employeeId}/time-cards`)
      if (!response.ok) throw new Error("Failed to fetch time cards")
      return response.json()
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Cards</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeCards?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No time cards found
                  </TableCell>
                </TableRow>
              ) : (
                timeCards?.map((timeCard: any) => (
                  <TableRow key={timeCard.id}>
                    <TableCell>
                      {format(new Date(timeCard.date), "PPP")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(timeCard.clockIn), "p")}
                    </TableCell>
                    <TableCell>
                      {timeCard.clockOut
                        ? format(new Date(timeCard.clockOut), "p")
                        : "-"}
                    </TableCell>
                    <TableCell>{timeCard.totalHours || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          timeCard.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : timeCard.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {timeCard.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
} 