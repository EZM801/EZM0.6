"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  let errorMessage = "An error occurred during authentication."
  let errorDescription = "Please try again or contact support if the problem persists."

  switch (error) {
    case "Configuration":
      errorMessage = "Server configuration error"
      errorDescription = "There is a problem with the server configuration."
      break
    case "AccessDenied":
      errorMessage = "Access denied"
      errorDescription = "You do not have permission to sign in."
      break
    case "Verification":
      errorMessage = "Verification failed"
      errorDescription = "The verification token has expired or has already been used."
      break
    case "OAuthSignin":
      errorMessage = "OAuth sign in error"
      errorDescription = "Error in constructing an authorization URL."
      break
    case "OAuthCallback":
      errorMessage = "OAuth callback error"
      errorDescription = "Error in handling the response from an OAuth provider."
      break
    case "OAuthCreateAccount":
      errorMessage = "OAuth create account error"
      errorDescription = "Could not create OAuth provider user in the database."
      break
    case "EmailCreateAccount":
      errorMessage = "Email create account error"
      errorDescription = "Could not create email provider user in the database."
      break
    case "Callback":
      errorMessage = "Callback error"
      errorDescription = "There was an error in the OAuth callback handler."
      break
    case "OAuthAccountNotLinked":
      errorMessage = "OAuth account not linked"
      errorDescription = "To confirm your identity, sign in with the same account you used originally."
      break
    case "EmailSignin":
      errorMessage = "Email sign in error"
      errorDescription = "The email sign in link is no longer valid."
      break
    case "CredentialsSignin":
      errorMessage = "Credentials sign in error"
      errorDescription = "Sign in failed. Check the details you provided are correct."
      break
    case "SessionRequired":
      errorMessage = "Session required"
      errorDescription = "Please sign in to access this page."
      break
    case "Default":
      errorMessage = "Default error"
      errorDescription = "An unknown error occurred."
      break
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-destructive">{errorMessage}</CardTitle>
        <CardDescription>{errorDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          If you continue to experience issues, please contact support.
        </p>
      </CardContent>
    </Card>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorContent />
      </Suspense>
    </div>
  )
}
