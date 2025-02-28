import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get user data
    const [user] = await sql`
      SELECT * FROM users WHERE id = 1
    `

    // Get user's stocks
    const holdings = await sql`
      SELECT 
        us.quantity,
        us.purchase_price,
        s.name,
        s.symbol,
        s.current_price
      FROM user_stocks us
      JOIN stocks s ON us.stock_id = s.id
      WHERE us.user_id = 1
    `

    return NextResponse.json({
      user,
      holdings
    })
  } catch (error: any) {
    console.error('Error fetching user data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}
