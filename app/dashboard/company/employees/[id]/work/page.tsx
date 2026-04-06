"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmployeeSchedule } from "@/components/employee-work/employee-schedule"
import { EmployeeTimeOff } from "@/components/employee-work/employee-time-off"
import { EmployeeTimeCards } from "@/components/employee-work/employee-time-cards"
import { EmployeeJobHistory } from "@/components/employee-work/employee-job-history"
import { useParams } from "next/navigation"

export default function EmployeeWorkPage() {
  const params = useParams()
  const employeeId = params.id as string
  const [activeTab, setActiveTab] = useState("schedule")

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Employee Work Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="time-off">Time Off</TabsTrigger>
              <TabsTrigger value="time-cards">Time Cards</TabsTrigger>
              <TabsTrigger value="job-history">Job History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="schedule">
              <EmployeeSchedule employeeId={employeeId} />
            </TabsContent>
            
            <TabsContent value="time-off">
              <EmployeeTimeOff employeeId={employeeId} />
            </TabsContent>
            
            <TabsContent value="time-cards">
              <EmployeeTimeCards employeeId={employeeId} />
            </TabsContent>
            
            <TabsContent value="job-history">
              <EmployeeJobHistory employeeId={employeeId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 