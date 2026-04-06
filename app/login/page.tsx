"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
})

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  // Debug logging for session changes
  useEffect(() => {
    console.log("Session status changed:", status)
    console.log("Current session:", session)
  }, [session, status])

  // Handle initial session redirect
  useEffect(() => {
    console.log("Checking session for redirect...")
    console.log("Status:", status)
    console.log("Session:", session)

    if (status === "authenticated" && session?.user) {
      console.log("User is authenticated")
      console.log("User type:", session.user.userType)
      
      if (session.user.userType === "COMPANY") {
        console.log("Redirecting company user to /dashboard/company")
        router.push("/dashboard/company")
      } else {
        console.log("Redirecting regular user to /dashboard")
        router.push("/dashboard")
      }
    }
  }, [session, status, router])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    console.log("Starting login process...")

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      console.log("Sign in result:", result)

      if (result?.error) {
        console.error("Login error:", result.error)
        toast.error("Invalid email or password")
        setIsSubmitting(false)
        return
      }

      // Force a hard redirect after successful login
      if (result?.ok) {
        toast.success("Login successful")
        // Force a page reload to ensure session is updated
        window.location.href = "/dashboard/company"
      }

    } catch (error) {
      console.error("Login error:", error)
      toast.error("An error occurred during login")
      setIsSubmitting(false)
    }
  }

  // If loading, show nothing to prevent flash
  if (status === "loading") {
    console.log("Page is in loading state")
    return null
  }

  // If already authenticated, don't show login page
  if (status === "authenticated") {
    console.log("User is already authenticated, hiding login page")
    return null
  }

  return (
    <div className="container grid flex-1 items-center gap-12 py-12 md:grid-cols-2 md:py-20">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Welcome Back</h1>
          <p className="mt-4 text-muted-foreground">
            Sign in to your account to continue managing your moves.
          </p>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-lg md:aspect-square">
          <Image
            src="/placeholder.svg?height=600&width=600&text=Moving+Boxes"
            alt="Moving boxes illustration"
            fill
            className="object-cover"
          />
        </div>
      </div>
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          {...field} 
                          className="rounded-full pr-10" 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

