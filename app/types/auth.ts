import { User as PrismaUser } from "@prisma/client"
import { DefaultSession } from "next-auth"

export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  companyId?: string
  userType: string
}

export interface Session extends DefaultSession {
  user: User
}

export interface Token {
  id: string
  email: string
  companyId?: string
  userType: string
  iat: number
  exp: number
  jti: string
}

export type AuthUser = Pick<PrismaUser, "id" | "email" | "firstName" | "lastName" | "companyId" | "userType"> 