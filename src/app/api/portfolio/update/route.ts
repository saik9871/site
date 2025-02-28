import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Get all users
    const users = await sql`SELECT id, balance FROM users`

    for (const user of users) {
      // Calculate stock value
      const [stockValue] = await sql`
        SELECT COALESCE(SUM(us.quantity * s.current_price), 0) as total_stock_value
        FROM user_stocks us
        JOIN stocks s ON us.stock_id = s.id
        WHERE us.user_id = ${user.id}
      `

      // Calculate total value
      const totalValue = parseFloat(user.balance) + parseFloat(stockValue.total_stock_value)

      // Get previous day's total value for profit/loss calculation
      const [previousValue] = await sql`
        SELECT total_value
        FROM portfolio_history
        WHERE user_id = ${user.id}
        AND timestamp::date = CURRENT_DATE - 1
        ORDER BY timestamp DESC
        LIMIT 1
      `

      // Calculate profit/loss
      const dailyProfitLoss = previousValue ? totalValue - parseFloat(previousValue.total_value) : 0

      // Insert new history record
      await sql`
        INSERT INTO portfolio_history (
          user_id,
          total_value,
          cash_balance,
          stock_value,
          daily_profit_loss,
          total_profit_loss
        ) VALUES (
          ${user.id},
          ${totalValue},
          ${user.balance},
          ${stockValue.total_stock_value},
          ${dailyProfitLoss},
          ${totalValue - 500.00} -- Initial balance was 500
        )
      `
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating portfolio history:', error)
    return NextResponse.json(
      { error: 'Failed to update portfolio history' },
      { status: 500 }
    )
  }
}
