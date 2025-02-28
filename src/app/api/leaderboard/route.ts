import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const leaderboardData = await sql`
      WITH latest_portfolio AS (
        SELECT DISTINCT ON (user_id)
          user_id,
          total_value,
          daily_profit_loss,
          total_profit_loss
        FROM portfolio_history
        ORDER BY user_id, timestamp DESC
      )
      SELECT 
        u.username,
        lp.total_value,
        lp.daily_profit_loss,
        lp.total_profit_loss,
        RANK() OVER (ORDER BY lp.total_value DESC) as rank
      FROM users u
      LEFT JOIN latest_portfolio lp ON u.id = lp.user_id
      ORDER BY lp.total_value DESC NULLS LAST
    `

    return NextResponse.json(leaderboardData)
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    )
  }
}
