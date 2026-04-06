"use client"

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

interface EmployeeJobHistoryProps {
  employeeId: string
}

export function EmployeeJobHistory({ employeeId }: EmployeeJobHistoryProps) {
  const { data: jobHistory, isLoading } = useQuery({
    queryKey: ["employee-job-history", employeeId],
    queryFn: async () => {
      const response = await fetch(`/api/employees/${employeeId}/job-history`)
      if (!response.ok) throw new Error("Failed to fetch job history")
      return response.json()
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobHistory?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No job history found
                  </TableCell>
                </TableRow>
              ) : (
                jobHistory?.map((job: any) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.role}</TableCell>
                    <TableCell>
                      {format(new Date(job.startDate), "PPP")}
                    </TableCell>
                    <TableCell>
                      {job.endDate ? format(new Date(job.endDate), "PPP") : "Present"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          job.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : job.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {job.status}
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