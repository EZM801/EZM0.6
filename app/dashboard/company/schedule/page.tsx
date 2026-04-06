"use client"

import { useState } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import prisma from "@/app/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, parseISO } from "date-fns"
import { Prisma } from "@prisma/client"
import { CalendarIcon } from "lucide-react"

type DbEvent = {
  id: string
  title: string
  date: Date
  startTime: string
  endTime: string
  type: string
  location: string
  description: string
  attendees: {
    user: {
      id: string
      name: string | null
      image: string | null
    }
  }[]
}

type DbMove = {
  id: string
  title: string
  clientName: string | null
  fromStreet: string
  fromCity: string
  fromState: string
}

// Define Prisma include types
const eventInclude = {
  attendees: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  }
} as const

const jobSelect = {
  id: true,
  title: true,
  clientName: true,
  fromStreet: true,
  fromCity: true,
  fromState: true
} as const

interface Event {
  id: string
  title: string
  date: Date
  startTime: string
  endTime: string
  type: string
  location: string
  description: string
  attendees: {
    user: {
      id: string
      name: string | null
      image: string | null
    }
  }[]
}

interface Job {
  id: string
  name: string
  client: string
  address: string
}

interface NewEvent {
  title: string
  date: string
  startTime: string
  endTime: string
  type: string
  location: string
  description: string
  attendees: string[]
  jobId?: string
}

// Helper function to get events for a specific date
const getEventsForDate = (events: Event[], date: Date) => {
  return events.filter(event => 
    format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
  )
}

// Helper function to get badge variant based on event type
const getEventBadgeVariant = (type: string) => {
  switch (type.toLowerCase()) {
    case 'meeting':
      return 'default'
    case 'move':
      return 'secondary'
    case 'training':
      return 'destructive'
    default:
      return 'outline'
  }
}

export default async function SchedulePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  // Fetch events from the database
  const dbEvents = await prisma.event.findMany({
    where: {
      userId: session.user.id
    },
    include: eventInclude,
    orderBy: {
      date: 'asc'
    }
  })

  // Format event data
  const events: Event[] = dbEvents.map((event: DbEvent) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    type: event.type,
    location: event.location,
    description: event.description,
    attendees: event.attendees
  }))

  // Fetch jobs from the database
  const dbJobs = await prisma.move.findMany({
    where: {
      userId: session.user.id,
      status: { in: ['PENDING', 'IN_PROGRESS'] }
    },
    select: jobSelect
  })

  // Format job data
  const jobs: Job[] = dbJobs.map((job: DbMove) => ({
    id: job.id,
    name: job.title,
    client: job.clientName || 'Unknown Client',
    address: `${job.fromStreet}, ${job.fromCity}, ${job.fromState}`
  }))

  const [date, setDate] = useState<Date>(new Date())

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="container py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Schedule</h1>
            <p className="text-muted-foreground">Manage your team's schedule and appointments</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[350px_1fr]">
          <Card className="border-none rounded-3xl soft-shadow">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar 
                mode="single" 
                selected={date} 
                onSelect={(newDate) => newDate && setDate(newDate)} 
                className="rounded-md border" 
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none rounded-3xl soft-shadow">
              <CardHeader>
                <CardTitle>{format(date, 'EEEE, MMMM d, yyyy')}</CardTitle>
                <CardDescription>
                  {getEventsForDate(events, date).length} events scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getEventsForDate(events, date).length === 0 ? (
                  <div className="text-center py-10">
                    <CalendarIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-2 text-muted-foreground">No events scheduled for this day</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getEventsForDate(events, date)
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((event) => (
                        <div key={event.id} className="flex items-center gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant={getEventBadgeVariant(event.type)}>
                                {event.type}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {event.attendees.map((attendee) => (
                                  <Avatar key={attendee.user.id} className="h-6 w-6 border-2 border-background">
                                    <AvatarImage src={attendee.user.image || undefined} alt={attendee.user.name || undefined} />
                                    <AvatarFallback>{attendee.user.name?.[0] || '?'}</AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

