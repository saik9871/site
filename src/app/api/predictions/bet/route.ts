import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { predictionId, amount, chosenOption } = await request.json()
    const userId = 1 // TODO: Get from auth session

    // Start transaction
    await sql`BEGIN`

    try {
      // Check user balance
      const [user] = await sql`
        SELECT balance FROM users WHERE id = ${userId}
      `

      if (user.balance < amount) {
        throw new Error('Insufficient balance')
      }

      // Check if prediction is still active
      const [prediction] = await sql`
        SELECT * FROM predictions 
        WHERE id = ${predictionId} AND end_time > NOW()
      `

      if (!prediction) {
        throw new Error('Prediction not found or expired')
      }

      // Update user balance
      await sql`
        UPDATE users 
        SET balance = balance - ${amount}
        WHERE id = ${userId}
      `

      // Place bet
      await sql`
        INSERT INTO bets (user_id, prediction_id, amount, chosen_option)
        VALUES (${userId}, ${predictionId}, ${amount}, ${chosenOption})
      `

      await sql`COMMIT`
      return NextResponse.json({ success: true })
    } catch (error) {
      await sql`ROLLBACK`
      throw error
    }
  } catch (error: any) {
    console.error('Error placing bet:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to place bet' },
      { status: 400 }
    )
  }
}
