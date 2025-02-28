import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { predictionId, winningOption } = await request.json()
    console.log('Resolving prediction:', { predictionId, winningOption })
    console.log('Request body:', { predictionId, winningOption })

    // First, check if prediction exists
    const [prediction] = await sql`
      SELECT * FROM predictions WHERE id = ${predictionId}
    `
    console.log('Found prediction:', prediction)
    console.log('Current prediction state:', prediction)

    if (!prediction) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      )
    }

    try {
      // Start transaction
      console.log('Starting transaction')

      // Update prediction first
      const updateResult = await sql`
        UPDATE predictions 
        SET resolved = true, winning_option = ${winningOption}
        WHERE id = ${predictionId}
        RETURNING *
      `
      console.log('Update result:', updateResult)

      // Get total pool and winning pool
      const [poolInfo] = await sql`
        SELECT 
          COALESCE(SUM(amount), 0) as total_pool,
          COALESCE(SUM(CASE WHEN chosen_option = ${winningOption} THEN amount ELSE 0 END), 0) as winning_pool
        FROM bets 
        WHERE prediction_id = ${predictionId}
      `
      console.log('Pool info:', poolInfo)

      // Get all winning bets for debugging
      const winningBets = await sql`
        SELECT * FROM bets 
        WHERE prediction_id = ${predictionId} 
        AND chosen_option = ${winningOption}
      `
      console.log('Winning bets:', winningBets)

      // Only distribute if there are winning bets
      if (poolInfo.winning_pool > 0) {
        const updateUsersResult = await sql`
          UPDATE users u
          SET balance = balance + (
            SELECT (b.amount / ${poolInfo.winning_pool}::decimal * ${poolInfo.total_pool}::decimal)
            FROM bets b
            WHERE b.user_id = u.id 
            AND b.prediction_id = ${predictionId}
            AND b.chosen_option = ${winningOption}
          )
          WHERE id IN (
            SELECT user_id 
            FROM bets 
            WHERE prediction_id = ${predictionId}
            AND chosen_option = ${winningOption}
          )
          RETURNING id, balance
        `
        console.log('Users update result:', updateUsersResult)
      }

      await sql`COMMIT`
      return NextResponse.json({ 
        success: true,
        prediction: updateResult[0],
        poolInfo,
        winningBets
      })
    } catch (error) {
      await sql`ROLLBACK`
      console.error('Transaction error:', error)
      throw error
    }
  } catch (error: any) {
    console.error('Error resolving prediction:', {
      message: error.message,
      stack: error.stack,
      error
    })
    return NextResponse.json(
      { 
        error: 'Failed to resolve prediction',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}
