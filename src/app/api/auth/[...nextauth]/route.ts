import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'

const handler = NextAuth({
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
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const { host } = new URL(url)
        const transport = nodemailer.createTransport(provider.server)

        console.log('[NextAuth] Sending verification email to:', email)
        console.log('[NextAuth] Magic link URL:', url)

        const result = await transport.sendMail({
          to: email,
          from: provider.from,
          subject: `Sign in to ${host}`,
          text: `Sign in to ${host}\n${url}\n\n`,
          html: `<body style="background: #f9f9f9;">
  <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: #fff; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr><td align="center" style="padding: 10px 0; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: #444;">Sign in to <strong>${host.replace(/\./g, '&#8203;.')}</strong></td></tr>
    <tr><td align="center" style="padding: 20px 0;">
      <a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: #fff; text-decoration: none; border-radius: 5px; padding: 10px 20px; background: #4f46e5; display: inline-block; font-weight: bold;">Sign in</a>
    </td></tr>
    <tr><td align="center" style="padding: 0 0 10px; font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #444;">If you did not request this email you can safely ignore it.</td></tr>
  </table>
</body>`,
        })

        console.log('[NextAuth] SMTP result:', JSON.stringify(result))

        const failed = result.rejected.concat(result.pending).filter(Boolean)
        if (failed.length) {
          console.error('[NextAuth] Email rejected for:', failed.join(', '))
          throw new Error(`Email (${failed.join(', ')}) could not be sent`)
        }

        console.log('[NextAuth] Email sent successfully to:', email)
      },
    }),
  ],
  pages: {
    signIn: '/signin',
    verifyRequest: '/verify-request',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
