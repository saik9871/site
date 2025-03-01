import NextAuth from 'next-auth'
import TwitchProvider from '@auth/core/providers/twitch'
import { sql } from '@/lib/db'

export const { auth, handlers: { GET, POST } } = NextAuth({
  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'twitch') {
        try {
          const [userCount] = await sql`SELECT COUNT(*) as count FROM users`
          const role = parseInt(userCount.count) === 0 ? 'admin' : 'user'
          
          await sql`
            INSERT INTO users (username, twitch_id, balance, role)
            VALUES (${user.name}, ${user.id}, 500.00, ${role})
            ON CONFLICT (twitch_id) DO UPDATE SET username = ${user.name}
            RETURNING *
          `
        } catch (error) {
          console.error('Error saving user:', error)
          return false
        }
      }
      return true
    }
  }
})
