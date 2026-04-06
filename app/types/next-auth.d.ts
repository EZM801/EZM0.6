import { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import NextAuth from "next-auth"
import { Company, User } from "@prisma/client"

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      userType: string;
      companyId: string | null;
      company: Company | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    userType: string;
    companyId: string | null;
    company: Company | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    userType: string;
    companyId: string | null;
    company: Company | null;
  }
} 