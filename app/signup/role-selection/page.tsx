"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Building2, ArrowRight, Check } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { BlobBackground } from "@/components/blob-background"

export default function RoleSelectionPage() {
  const [selectedTab, setSelectedTab] = useState("individual")
  const [companyRole, setCompanyRole] = useState("worker")
  const [companyName, setCompanyName] = useState("")
  const [companyCode, setCompanyCode] = useState("")
  const [isJoining, setIsJoining] = useState(true)
  const router = useRouter()

  const handleContinue = () => {
    // In a real app, you would save this information to the user's profile
    console.log({
      userType: selectedTab,
      companyRole: selectedTab === "company" ? companyRole : null,
      companyName: selectedTab === "company" && !isJoining ? companyName : null,
      companyCode: selectedTab === "company" && isJoining ? companyCode : null,
    })

    // Redirect based on user type
    if (selectedTab === "individual") {
      router.push("/dashboard")
    } else {
      router.push("/dashboard/company")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <BlobBackground />
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="mx-auto w-full max-w-md border-none rounded-3xl soft-shadow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-text">Choose Your Account Type</CardTitle>
            <CardDescription>Select how you'll be using Eazy Move</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="individual" className="w-full" onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2 rounded-full">
                <TabsTrigger value="individual" className="rounded-full">
                  <User className="mr-2 h-4 w-4" />
                  Individual
                </TabsTrigger>
                <TabsTrigger value="company" className="rounded-full">
                  <Building2 className="mr-2 h-4 w-4" />
                  Company
                </TabsTrigger>
              </TabsList>
              <TabsContent value="individual" className="mt-6 space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Individual Account</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Perfect for personal moves. Organize your move, track your items, and manage your relocation
                        without any company features.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="company" className="mt-6 space-y-6">
                <div className="flex gap-4">
                  <Button
                    variant={isJoining ? "default" : "outline"}
                    className="flex-1 rounded-full"
                    onClick={() => setIsJoining(true)}
                  >
                    Join Company
                  </Button>
                  <Button
                    variant={!isJoining ? "default" : "outline"}
                    className="flex-1 rounded-full"
                    onClick={() => setIsJoining(false)}
                  >
                    Create Company
                  </Button>
                </div>

                {isJoining ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyCode">Company Code</Label>
                      <Input
                        id="companyCode"
                        placeholder="Enter your company code"
                        value={companyCode}
                        onChange={(e) => setCompanyCode(e.target.value)}
                        className="rounded-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the code provided by your company administrator
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        placeholder="Enter your company name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="rounded-full"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label>Select Your Role</Label>
                  <RadioGroup
                    defaultValue="worker"
                    value={companyRole}
                    onValueChange={setCompanyRole}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 rounded-lg border p-3">
                      <RadioGroupItem value="admin" id="admin" />
                      <Label htmlFor="admin" className="flex flex-1 items-center justify-between cursor-pointer">
                        <div>
                          <p className="font-medium">Administrator</p>
                          <p className="text-sm text-muted-foreground">Full access to all features</p>
                        </div>
                        {companyRole === "admin" && (
                          <div className="rounded-full bg-primary/10 p-1">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border p-3">
                      <RadioGroupItem value="foreman" id="foreman" />
                      <Label htmlFor="foreman" className="flex flex-1 items-center justify-between cursor-pointer">
                        <div>
                          <p className="font-medium">Foreman</p>
                          <p className="text-sm text-muted-foreground">Manage jobs and team members</p>
                        </div>
                        {companyRole === "foreman" && (
                          <div className="rounded-full bg-primary/10 p-1">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border p-3">
                      <RadioGroupItem value="worker" id="worker" />
                      <Label htmlFor="worker" className="flex flex-1 items-center justify-between cursor-pointer">
                        <div>
                          <p className="font-medium">Worker</p>
                          <p className="text-sm text-muted-foreground">Access to assigned jobs and tasks</p>
                        </div>
                        {companyRole === "worker" && (
                          <div className="rounded-full bg-primary/10 p-1">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button className="w-full rounded-full" onClick={handleContinue}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

