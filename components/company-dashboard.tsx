"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, Users, Calendar, Package, BarChart4, Clock, CheckCircle2, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface DashboardStats {
  activeMoves: number
  completedMoves: number
  employees: number
  inventory: number
  revenue: string
  upcomingMoves: number
}

interface Move {
  id: string
  client: string
  fromAddress: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  toAddress: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  moveDate: string
  status: string
  team: string[]
  progress: number
}

interface ScheduleItem {
  id: string
  title: string
  time: string
  date: string
}

interface CompanyDashboardProps {
  stats: DashboardStats
  moves: Move[]
  schedule: ScheduleItem[]
}

export function CompanyDashboard({ stats, moves, schedule }: CompanyDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const user = {
    name: "Jane Smith",
    role: "admin", // or "foreman" or "worker"
    company: "Acme Moving Co.",
  }

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Render different content based on user role
  const renderRoleSpecificContent = () => {
    if (user.role === "admin") {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-none rounded-3xl soft-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.employees}</div>
              <p className="text-sm text-muted-foreground">Active team members</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="gap-1" asChild>
                <Link href="/dashboard/company/employees">
                  Manage Team
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-none rounded-3xl soft-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BarChart4 className="mr-2 h-5 w-5 text-primary" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.revenue}</div>
              <p className="text-sm text-muted-foreground">This month</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="gap-1" asChild>
                <Link href="/dashboard/company/reports">
                  View Reports
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-none rounded-3xl soft-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Package className="mr-2 h-5 w-5 text-primary" />
                Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.inventory}</div>
              <p className="text-sm text-muted-foreground">Items tracked</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="gap-1" asChild>
                <Link href="/dashboard/company/inventory">
                  Manage Inventory
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    if (user.role === "foreman") {
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none rounded-3xl soft-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["John D.", "Mike S.", "Sarah L.", "Alex M."].map((member, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {member.charAt(0)}
                      </div>
                      <span>{member}</span>
                    </div>
                    <Badge variant={index < 3 ? "default" : "outline"} className="rounded-full">
                      {index < 3 ? "On Move #1" : "Available"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="gap-1" asChild>
                <Link href="/dashboard/company/team">
                  Manage Team
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-none rounded-3xl soft-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedule
                  .filter((item) => item.date === "Today")
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.time}</p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-full">
                        View
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="gap-1" asChild>
                <Link href="/dashboard/company/schedule">
                  Full Schedule
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    // Default for worker role
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none rounded-3xl soft-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Today's Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Johnson Move - Loading</p>
                  <p className="text-sm text-muted-foreground">11:00 AM - 3:00 PM</p>
                </div>
                <Badge className="rounded-full">Assigned</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Inventory Check</p>
                  <p className="text-sm text-muted-foreground">4:00 PM - 5:00 PM</p>
                </div>
                <Badge variant="outline" className="rounded-full">
                  Pending
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/dashboard/company/tasks">
                View All Tasks
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-none rounded-3xl soft-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Package className="mr-2 h-5 w-5 text-primary" />
              Assigned Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Living Room Items</p>
                  <p className="text-sm text-muted-foreground">12 items</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">
                  View
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Kitchen Items</p>
                  <p className="text-sm text-muted-foreground">24 items</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">
                  View
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/dashboard/company/inventory">
                View All Items
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Company Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to {user.company}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6" onValueChange={handleTabChange}>
        <TabsList className="rounded-full p-1">
          <TabsTrigger value="overview" className="rounded-full">
            Overview
          </TabsTrigger>
          <TabsTrigger value="moves" className="rounded-full">
            Active Moves
          </TabsTrigger>
          <TabsTrigger value="schedule" className="rounded-full">
            Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-none rounded-3xl soft-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Truck className="mr-2 h-5 w-5 text-primary" />
                  Active Moves
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.activeMoves}</div>
                <p className="text-sm text-muted-foreground">Moves in progress</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <Link href="/dashboard/company/move">
                    View Move
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <Link href="/dashboard/company/move/create">
                    Add New Move
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-none rounded-3xl soft-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.completedMoves}</div>
                <p className="text-sm text-muted-foreground">Total moves completed</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <Link href="/dashboard/company/move?filter=completed">
                    View History
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-none rounded-3xl soft-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.upcomingMoves}</div>
                <p className="text-sm text-muted-foreground">Scheduled moves</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <Link href="/dashboard/company/schedule">
                    View Schedule
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {renderRoleSpecificContent()}
        </TabsContent>

        <TabsContent value="moves" className="space-y-6">
          <div className="grid gap-6">
            {moves.map((move) => (
              <Card key={move.id} className="border-none rounded-3xl soft-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle>{move.client}</CardTitle>
                    <Badge variant={move.status === "IN_PROGRESS" ? "default" : "outline"} className="rounded-full">
                      {formatStatus(move.status)}
                    </Badge>
                  </div>
                  <CardDescription>Moving on {move.moveDate}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2 text-sm">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">From:</p>
                        <p className="text-muted-foreground">
                          {move.fromAddress.street}, {move.fromAddress.city}, {move.fromAddress.state}{" "}
                          {move.fromAddress.zipCode}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">To:</p>
                        <p className="text-muted-foreground">
                          {move.toAddress.street}, {move.toAddress.city}, {move.toAddress.state}{" "}
                          {move.toAddress.zipCode}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Progress:</p>
                      <div className="space-y-2">
                        <Progress value={move.progress} className="h-2" />
                        <p className="text-xs text-right text-muted-foreground">{move.progress}% Complete</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Team:</p>
                      <div className="flex flex-wrap gap-2">
                        {move.team.map((member, index) => (
                          <Badge key={index} variant="outline" className="rounded-full">
                            {member}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" asChild className="rounded-full">
                    <Link href={`/dashboard/company/move/${move.id}`}>View Details</Link>
                  </Button>
                  <Button variant="default" size="sm" className="rounded-full">
                    Update Status
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card className="border-none rounded-3xl soft-shadow">
            <CardHeader>
              <CardTitle>Upcoming Schedule</CardTitle>
              <CardDescription>Your scheduled events and moves</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Today</h3>
                  <div className="space-y-3">
                    {schedule
                      .filter((item) => item.date === "Today")
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.time}</p>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-full">
                            View
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Tomorrow</h3>
                  <div className="space-y-3">
                    {schedule
                      .filter((item) => item.date === "Tomorrow")
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.time}</p>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-full">
                            View
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="rounded-full">
                <Link href="/dashboard/company/schedule">View Full Calendar</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 