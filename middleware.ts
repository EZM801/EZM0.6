import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Export middleware configuration
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/dashboard/:path*",
    "/login",
  ]
}

export default withAuth(
  async function middleware(req) {
    console.log("Middleware running for path:", req.nextUrl.pathname)
    
    const token = req.nextauth.token
    const isAuthenticated = !!token
    const isCompanyUser = token?.userType === "COMPANY"
    const pathname = req.nextUrl.pathname

    console.log("Middleware - Path:", pathname)
    console.log("Middleware - Is authenticated:", isAuthenticated)
    console.log("Middleware - Is company user:", isCompanyUser)
    console.log("Middleware - Token:", token)

    // Handle login page - redirect if already authenticated
    if (pathname === "/login") {
      if (isAuthenticated) {
        return NextResponse.redirect(
          new URL(isCompanyUser ? "/dashboard/company" : "/dashboard", req.url)
        )
      }
      return NextResponse.next()
    }

    // Handle protected routes
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Handle company routes
    if (pathname.startsWith("/dashboard/company")) {
      if (!isCompanyUser) {
        console.log("Non-company user trying to access company route, redirecting to dashboard")
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return NextResponse.next()
    }

    // Handle regular dashboard
    if (pathname === "/dashboard") {
      if (isCompanyUser) {
        console.log("Company user trying to access regular dashboard, redirecting to company dashboard")
        return NextResponse.redirect(new URL("/dashboard/company", req.url))
      }
      return NextResponse.next()
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow login page without authentication
        if (req.nextUrl.pathname === "/login") {
          return true
        }
        // Require authentication for all other routes
        return !!token && !!token.email && !!token.userType
      },
    },
  }
) 