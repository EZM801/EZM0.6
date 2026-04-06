"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface JoinData {
  type: string
  token: string
  companyId: string
  expires: string
}

export default function JoinPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [joinData, setJoinData] = useState<JoinData | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const data = searchParams.get("data")
    if (data) {
      try {
        const decoded = JSON.parse(data) as JoinData
        // Verify the invitation hasn't expired
        if (new Date(decoded.expires) < new Date()) {
          toast.error("This invitation has expired")
          return
        }
        setJoinData(decoded)
      } catch (error) {
        console.error("Error parsing join data:", error)
        toast.error("Invalid invitation data")
      }
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!joinData) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          token: joinData.token,
          companyId: joinData.companyId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to join company")
      }

      toast.success("Successfully joined company")
      router.push("/login")
    } catch (error) {
      console.error("Error joining company:", error)
      toast.error("Failed to join company")
    } finally {
      setIsLoading(false)
    }
  }

  if (!joinData) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Invalid Invitation</CardTitle>
          <CardDescription>
            This invitation link is invalid or has expired.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Join Company</CardTitle>
        <CardDescription>
          Complete your registration to join the company
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Joining..." : "Join Company"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 