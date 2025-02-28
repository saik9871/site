import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)
    const { username, balance, role } = await request.json()

    const [updatedUser] = await sql`
      UPDATE users
      SET 
        username = ${username},
        balance = ${balance},
        role = ${role}
      WHERE id = ${userId}
      RETURNING *
    `

    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
