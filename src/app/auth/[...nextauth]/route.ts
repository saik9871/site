import NextAuth, { DefaultSession, NextAuthOptions } from 'next-auth'
import TwitchProvider from 'next-auth/providers/twitch'
import { JWT } from 'next-auth/jwt'
import { sql } from '@/lib/db'

interface CustomSession extends DefaultSession {
  user: {
    id?: string
    name?: string | null
    balance?: number
    role?: string
  } & DefaultSession['user']
}

export const authOptions: NextAuthOptions = {
  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }: { user: any; account: any }) {
      if (account?.provider === 'twitch') {
        try {
          // Check if this is the first user ever
          const [userCount] = await sql`
            SELECT COUNT(*) as count FROM users
          `

          // Determine role (first user gets admin)
          const role = parseInt(userCount.count) === 0 ? 'admin' : 'user'

          // Insert or update user
          await sql`
            INSERT INTO users (
              username,
              twitch_id,
              balance,
              role
            ) VALUES (
              ${user.name},
              ${user.id},
              500.00,
              ${role}
            )
            ON CONFLICT (twitch_id) 
            DO UPDATE SET 
              username = ${user.name}
            RETURNING *
          `
        } catch (error) {
          console.error('Error saving user:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }): Promise<CustomSession> {
      const [dbUser] = await sql`
        SELECT id, username, balance, role 
        FROM users 
        WHERE twitch_id = ${token.sub}
      `
      
      return {
        ...session,
        user: {
          ...session.user,
          id: dbUser.id,
          balance: dbUser.balance,
          role: dbUser.role
        }
      }
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
