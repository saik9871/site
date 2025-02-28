import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Create a test user with ID 1
    const result = await sql`
      INSERT INTO users (id, username, balance)
      VALUES (1, 'testuser', 500.00)
      ON CONFLICT (id) DO UPDATE 
      SET balance = 500.00
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error('Error creating test user:', error)
    return NextResponse.json(
      { error: 'Failed to create test user' },
      { status: 500 }
    )
  }
}
