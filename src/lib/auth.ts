import { getServerSession } from 'next-auth'
import type { AuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './db'

// Reuse the same auth options as the route handler
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma as any),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: '/signin',
    verifyRequest: '/verify-request',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}

/**
 * Get the current session in API routes and server components.
 * Usage: const session = await getAuth()
 */
export async function getAuth() {
  return getServerSession(authOptions)
}
