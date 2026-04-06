"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { Plus } from "lucide-react"

interface EmployeeScheduleProps {
  employeeId: string
}

interface JobAssignment {
  id: string
  jobId: string
  date: Date
  startTime: string
  endTime: string
  status: "scheduled" | "in-progress" | "completed"
}

export function EmployeeSchedule({ employeeId }: EmployeeScheduleProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [jobAssignments, setJobAssignments] = useState<JobAssignment[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState("")

  // Mock jobs data - replace with actual API call
  const jobs = [
    { id: "1", name: "Job 1" },
    { id: "2", name: "Job 2" },
    { id: "3", name: "Job 3" },
  ]

  const handleAddAssignment = () => {
    if (!date || !selectedJob) return

    const newAssignment: JobAssignment = {
      id: Math.random().toString(36).substr(2, 9),
      jobId: selectedJob,
      date: date,
      startTime: "09:00",
      endTime: "17:00",
      status: "scheduled",
    }

    setJobAssignments([...jobAssignments, newAssignment])
    setIsAddDialogOpen(false)
    setSelectedJob("")
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Schedule for {format(date || new Date(), "MMMM yyyy")}</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Job Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Job Assignment</DialogTitle>
              <DialogDescription>
                Assign a job to the selected date
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Selected Date</label>
                <p className="text-sm text-muted-foreground">
                  {date ? format(date, "PPP") : "No date selected"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Job</label>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddAssignment}>Add Assignment</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {jobAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No job assignments for this date</p>
            ) : (
              <div className="space-y-2">
                {jobAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-3 border rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">
                        {jobs.find((j) => j.id === assignment.jobId)?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.startTime} - {assignment.endTime}
                      </p>
                    </div>
                    <Badge variant={assignment.status === "completed" ? "default" : "secondary"}>
                      {assignment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 