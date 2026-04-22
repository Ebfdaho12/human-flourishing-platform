import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import * as argon2 from "argon2"
import { rateLimit } from "./security"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null

          // Rate limit login attempts: 5 per 5 minutes per email
          if (!rateLimit(`login:${credentials.email.toLowerCase()}`, 5, 300000)) {
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase().trim() },
            include: { profile: true },
          })

          if (!user) return null

          const valid = await argon2.verify(user.passwordHash, credentials.password)
          if (!valid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.profile?.displayName ?? null,
          }
        } catch (error) {
          console.error("AUTH ERROR:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email ?? ""
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    },
  },
}
