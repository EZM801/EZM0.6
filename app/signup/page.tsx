"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type SubmitHandler } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Building2, User, Truck } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  userType: z.enum(["individual", "company"]),
  companyName: z.string().optional(),
  companyCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine(
  (data) => {
    if (data.userType === "company") {
      return data.companyName && data.companyCode
    }
    return true
  },
  {
    message: "Company name and code are required for company accounts",
    path: ["companyName"],
  }
)

type FormValues = z.infer<typeof formSchema>

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userType, setUserType] = useState<"individual" | "company">("individual")
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      userType: "individual",
      companyName: "",
      companyCode: "",
    },
    mode: "onChange",
  })

  // Update form validation schema when user type changes
  const handleUserTypeChange = (value: "individual" | "company") => {
    setUserType(value)
    form.setValue("userType", value)
  }

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          userType: values.userType,
          ...(values.userType === 'company' && {
            companyName: values.companyName,
            companyCode: values.companyCode,
          }),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      // Redirect to login page
      router.push('/login')
      toast({
        title: "Account created successfully!",
        description: "Please log in to continue.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8">
        <Button variant="ghost" className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          <span className="text-xl font-bold gradient-text">Eazy Move</span>
        </Button>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your information below to create your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue="individual"
            onValueChange={(value) => handleUserTypeChange(value as "individual" | "company")}
            className="mb-6"
          >
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
          </Tabs>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} className="rounded-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} className="rounded-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} className="rounded-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} className="rounded-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} className="rounded-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {userType === "company" && (
                <>
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Moving Co." {...field} className="rounded-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Code</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC123" {...field} className="rounded-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

