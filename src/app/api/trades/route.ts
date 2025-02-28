import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { stockId, quantity, tradeType } = await request.json()
    
    // TODO: Get actual user ID from session
    const userId = 1 // Temporary user ID

    // Start transaction
    await sql`BEGIN`

    try {
      // Get current stock data
      const [stock] = await sql`
        SELECT * FROM stocks WHERE id = ${stockId}
      `

      // Get user's current balance
      const [user] = await sql`
        SELECT * FROM users WHERE id = ${userId}
      `

      const totalCost = quantity * stock.current_price

      if (tradeType === 'buy') {
        // Check if user has enough balance
        if (user.balance < totalCost) {
          throw new Error('Insufficient balance')
        }

        // Check if enough supply is available
        if (stock.available_supply < quantity) {
          throw new Error('Insufficient stock supply')
        }

        // Update user's balance
        await sql`
          UPDATE users 
          SET balance = balance - ${totalCost}
          WHERE id = ${userId}
        `

        // Update stock's available supply
        await sql`
          UPDATE stocks 
          SET available_supply = available_supply - ${quantity}
          WHERE id = ${stockId}
        `

        // Add to user's portfolio
        await sql`
          INSERT INTO user_stocks (user_id, stock_id, quantity, purchase_price)
          VALUES (${userId}, ${stockId}, ${quantity}, ${stock.current_price})
          ON CONFLICT (user_id, stock_id) 
          DO UPDATE SET quantity = user_stocks.quantity + ${quantity}
        `
      } else {
        // Check if user has enough stocks to sell
        const [userStock] = await sql`
          SELECT * FROM user_stocks 
          WHERE user_id = ${userId} AND stock_id = ${stockId}
        `

        if (!userStock || userStock.quantity < quantity) {
          throw new Error('Insufficient stocks to sell')
        }

        // Update user's balance
        await sql`
          UPDATE users 
          SET balance = balance + ${totalCost}
          WHERE id = ${userId}
        `

        // Update stock's available supply
        await sql`
          UPDATE stocks 
          SET available_supply = available_supply + ${quantity}
          WHERE id = ${stockId}
        `

        // Update user's portfolio
        await sql`
          UPDATE user_stocks 
          SET quantity = quantity - ${quantity}
          WHERE user_id = ${userId} AND stock_id = ${stockId}
        `
      }

      await sql`COMMIT`
      return NextResponse.json({ success: true })
    } catch (error) {
      await sql`ROLLBACK`
      throw error
    }
  } catch (error: any) {
    console.error('Error processing trade:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process trade' },
      { status: 400 }
    )
  }
}
