import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = await Promise.resolve(params.id)
  const stockId = parseInt(id)
  
  try {
    if (isNaN(stockId)) {
      return NextResponse.json(
        { error: 'Invalid stock ID' },
        { status: 400 }
      )
    }

    // First, verify the stock exists
    const [stockExists] = await sql`
      SELECT id, current_price FROM stocks WHERE id = ${stockId}
    `

    if (!stockExists) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      )
    }

    // Simplified query to get just timestamp and price for the last 24 hours
    const history = await sql`
      SELECT 
        EXTRACT(EPOCH FROM timestamp)::bigint * 1000 as timestamp,
        price
      FROM price_history
      WHERE stock_id = ${stockId}
      AND timestamp >= NOW() - interval '24 hours'
      ORDER BY timestamp ASC
    `

    if (history.length === 0) {
      return NextResponse.json([{
        timestamp: Date.now(),
        price: parseFloat(stockExists.current_price)
      }])
    }

    return NextResponse.json(history)
  } catch (error: any) {
    console.error('Price history error:', {
      error,
      stockId: stockId,
      message: error.message,
      stack: error.stack
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch price history',
        details: error.message
      },
      { status: 500 }
    )
  }
}
