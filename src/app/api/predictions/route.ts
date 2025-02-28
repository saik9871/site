import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

interface Distribution {
  [key: string]: number
}

export async function POST(request: Request) {
  try {
    const { title, description, options, endTime } = await request.json()

    // Validate input
    if (!title || !options || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert prediction
    const result = await sql`
      INSERT INTO predictions (title, description, options, end_time)
      VALUES (${title}, ${description}, ${JSON.stringify(options)}, ${endTime})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error('Error creating prediction:', error)
    return NextResponse.json(
      { error: 'Failed to create prediction' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Even simpler query that just returns predictions first
    const predictions = await sql`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.options,
        p.end_time,
        p.resolved,
        p.winning_option,
        '{}'::jsonb as pool_distribution
      FROM predictions p
      ORDER BY p.end_time ASC
    `

    // Log the raw predictions
    console.log('Raw predictions:', predictions)

    // If we have any predictions, let's try to get their bets
    if (predictions.length > 0) {
      for (const prediction of predictions) {
        const bets = await sql`
          SELECT chosen_option, SUM(amount) as total_amount
          FROM bets
          WHERE prediction_id = ${prediction.id}
          GROUP BY chosen_option
        `
        
        // Convert bets to pool distribution object
        const distribution: Distribution = {}
        bets.forEach(bet => {
          distribution[bet.chosen_option] = parseFloat(bet.total_amount)
        })
        prediction.pool_distribution = distribution
      }
    }

    return NextResponse.json(predictions)
  } catch (error: any) {
    console.error('Detailed error in GET /api/predictions:', {
      message: error.message,
      stack: error.stack,
      error
    })

    return NextResponse.json(
      { error: 'Failed to fetch predictions', details: error.message },
      { status: 500 }
    )
  }
}
