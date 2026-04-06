import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { compare } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { sendEmail } from './email';
import type { DefaultSession, User } from 'next-auth';
import { Company } from '@prisma/client';

type UserType = "CUSTOMER" | "COMPANY" | "ADMIN";

interface BaseUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userType: UserType;
  companyId: string | null;
  company: Company | null;
  isActive: boolean;
  isVerified: boolean;
}

declare module 'next-auth' {
  interface Session {
    user: BaseUser & DefaultSession['user'];
  }

  interface User extends BaseUser {}
}

declare module 'next-auth/jwt' {
  interface JWT extends Omit<BaseUser, 'email'> {}
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            company: true
          }
        });

        if (!user || !user?.password) {
          throw new Error('User not found');
        }

        if (!user.isActive) {
          throw new Error('Account is deactivated');
        }

        if (!user.isVerified) {
          throw new Error('Email not verified');
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          // Update failed login attempts
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: {
                increment: 1
              },
              lastLoginAttempt: new Date(),
              // Lock account after 5 failed attempts
              isActive: user.failedLoginAttempts >= 4 ? false : true
            }
          });
          
          throw new Error('Invalid password');
        }

        // Reset failed login attempts on successful login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lastLoginAttempt: new Date(),
            lastLogin: new Date()
          }
        });

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType as UserType,
          companyId: user.companyId,
          company: user.company,
          isActive: user.isActive,
          isVerified: user.isVerified
        } as User;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "signIn" && user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.userType = user.userType;
        token.companyId = user.companyId;
        token.company = user.company;
        token.isActive = user.isActive;
        token.isVerified = user.isVerified;
      }

      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email as string;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.userType = token.userType as UserType;
        session.user.companyId = token.companyId;
        session.user.company = token.company;
        session.user.isActive = token.isActive;
        session.user.isVerified = token.isVerified;
      }
      return session;
    }
  },
  events: {
    async signIn({ user }) {
      // Log successful sign-in
      await prisma.userActivity.create({
        data: {
          userId: user.id,
          type: 'SIGN_IN',
          ipAddress: '',  // Add IP address handling if needed
          userAgent: ''   // Add user agent handling if needed
        }
      });
    },
    async signOut({ token }) {
      if (token?.id) {
        // Log sign-out
        await prisma.userActivity.create({
          data: {
            userId: token.id,
            type: 'SIGN_OUT',
            ipAddress: '',  // Add IP address handling if needed
            userAgent: ''   // Add user agent handling if needed
          }
        });
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
};

export async function generatePasswordResetToken(email: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); // 1 hour

  await prisma.verificationToken.create({
    data: {
      id: randomBytes(16).toString('hex'),
      identifier: email,
      token,
      expires,
      userId: user.id
    }
  });

  return token;
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  
  await sendEmail({
    to: email,
    subject: 'Reset your password',
    html: `
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `
  });
}

export async function generateVerificationToken(email: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); // 1 hour

  await prisma.verificationToken.create({
    data: {
      id: randomBytes(16).toString('hex'),
      identifier: email,
      token,
      expires,
      userId: user.id
    }
  });

  return token;
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
  
  await sendEmail({
    to: email,
    subject: 'Verify your email',
    html: `
      <p>Click the link below to verify your email:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `
  });
} 