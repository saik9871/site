import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, symbol, initialPrice, totalSupply } = await request.json()

    // Validate input
    if (!name || !symbol || !initialPrice || !totalSupply) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert the stock into database
    const result = await sql`
      INSERT INTO stocks (name, symbol, current_price, total_supply, available_supply)
      VALUES (${name}, ${symbol}, ${initialPrice}, ${totalSupply}, ${totalSupply})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: unknown) {
    console.error('Error creating stock:', error)
    return NextResponse.json(
      { error: 'Failed to create stock' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM stocks ORDER BY name ASC
    `

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching stocks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stocks' },
      { status: 500 }
    )
  }
}
