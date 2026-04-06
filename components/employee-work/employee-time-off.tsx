"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

interface EmployeeTimeOffProps {
  employeeId: string
}

export function EmployeeTimeOff({ employeeId }: EmployeeTimeOffProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const { data: timeOff, isLoading } = useQuery({
    queryKey: ["employee-time-off", employeeId],
    queryFn: async () => {
      const response = await fetch(`/api/employees/${employeeId}/time-off`)
      if (!response.ok) throw new Error("Failed to fetch time off data")
      return response.json()
    }
  })

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Time Off Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time Off Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <p>Loading...</p>
            ) : timeOff?.length === 0 ? (
              <p>No time off requests found.</p>
            ) : (
              timeOff?.map((request: any) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                    <p className="font-medium">{request.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(request.startDate), "PPP")} -{" "}
                      {format(new Date(request.endDate), "PPP")}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        request.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : request.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 