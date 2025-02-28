import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stockId = parseInt(params.id)
    const { type } = await request.json()
    
    if (type === 'view') {
      await sql`
        INSERT INTO stock_interactions (stock_id, views, buy_orders, sell_orders)
        VALUES (${stockId}, 0, 0, 0)
        ON CONFLICT (stock_id) DO UPDATE 
        SET views = stock_interactions.views + 1,
            last_viewed_at = CURRENT_TIMESTAMP
      `
    } else if (type === 'buy') {
      await sql`
        INSERT INTO stock_interactions (stock_id, views, buy_orders, sell_orders)
        VALUES (${stockId}, 0, 0, 0)
        ON CONFLICT (stock_id) DO UPDATE 
        SET buy_orders = stock_interactions.buy_orders + 1,
            last_viewed_at = CURRENT_TIMESTAMP
      `
    } else {
      await sql`
        INSERT INTO stock_interactions (stock_id, views, buy_orders, sell_orders)
        VALUES (${stockId}, 0, 0, 0)
        ON CONFLICT (stock_id) DO UPDATE 
        SET sell_orders = stock_interactions.sell_orders + 1,
            last_viewed_at = CURRENT_TIMESTAMP
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error recording interaction:', error)
    return NextResponse.json({ error: 'Failed to record interaction' }, { status: 500 })
  }
}
