import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

interface Params {
  params: {
    id: string
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
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
  } catch {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
