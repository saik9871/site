import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stockId = parseInt(params.id)
    const { name, current_price, total_supply } = await request.json()

    const [updatedStock] = await sql`
      UPDATE stocks
      SET 
        name = ${name},
        current_price = ${current_price},
        total_supply = ${total_supply}
      WHERE id = ${stockId}
      RETURNING *
    `

    return NextResponse.json(updatedStock)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stockId = parseInt(params.id)

    // Delete the stock
    await sql`
      DELETE FROM stocks
      WHERE id = ${stockId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete stock' },
      { status: 500 }
    )
  }
}
