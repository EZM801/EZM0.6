import { Company, User } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      firstName: string | null
      lastName: string | null
      userType: string
      companyId: string | null
      company: Company | null
    }
  }

  interface User {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    userType: string
    companyId: string | null
    company: Company | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    userType: string
    companyId: string | null
    company: Company | null
  }
} 