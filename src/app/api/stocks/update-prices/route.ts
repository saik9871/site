import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

async function calculateNewPrice(stock: any): Promise<number> {
  // Get stock interactions in a transaction to ensure data consistency
  const [interactions] = await sql`
    SELECT 
      views,
      buy_orders,
      sell_orders,
      last_viewed_at
    FROM stock_interactions 
    WHERE stock_id = ${stock.id}
    FOR UPDATE
  `

  const currentPrice = parseFloat(stock.current_price)
  
  if (!interactions) {
    return currentPrice
  }

  // 50% - Buy/Sell Pressure
  const totalOrders = interactions.buy_orders + interactions.sell_orders
  let orderPressure = 0
  if (totalOrders > 0) {
    const buyRatio = interactions.buy_orders / totalOrders
    orderPressure = (buyRatio - 0.5) * 0.1 // Max ±5% change from order pressure
  }

  // 30% - Real-time Views
  const viewImpact = (Math.log(interactions.views + 1) / 10) * 0.06 // Max 3% up from views

  // 10% - Time Decay
  const hoursSinceLastView = interactions.last_viewed_at 
    ? (Date.now() - new Date(interactions.last_viewed_at).getTime()) / (1000 * 60 * 60)
    : 24
  const timeDecay = Math.max(-0.02, -0.02 * Math.log(hoursSinceLastView + 1))

  // 10% - Random Market Noise
  const randomNoise = (Math.random() - 0.5) * 0.02

  // Combine all factors
  const totalChange = orderPressure + viewImpact + timeDecay + randomNoise
  
  // Apply change with limits and round to 2 decimals
  const newPrice = Math.max(0.01, currentPrice * (1 + totalChange))
  return Math.round(newPrice * 100) / 100
}

export async function POST() {
  try {
    // Start transaction to handle concurrent updates
    await sql`BEGIN`

    try {
      const stocks = await sql`SELECT * FROM stocks FOR UPDATE`

      for (const stock of stocks) {
        const newPrice = await calculateNewPrice(stock)
        
        await sql`
          WITH updated_stock AS (
            UPDATE stocks 
            SET current_price = ${newPrice}
            WHERE id = ${stock.id}
            RETURNING id, current_price
          )
          INSERT INTO price_history (
            stock_id,
            price,
            high_price,
            low_price,
            volume
          ) VALUES (
            ${stock.id},
            ${newPrice},
            ${Math.max(newPrice, parseFloat(stock.current_price))},
            ${Math.min(newPrice, parseFloat(stock.current_price))},
            ${Math.floor(Math.random() * 1000)}
          )
        `

        console.log('Price updated:', {
          stockId: stock.id,
          oldPrice: stock.current_price,
          newPrice: newPrice.toFixed(2),
          change: ((newPrice - parseFloat(stock.current_price)) / parseFloat(stock.current_price) * 100).toFixed(2) + '%'
        })
      }

      await sql`COMMIT`
      return NextResponse.json({ success: true })
    } catch (error) {
      await sql`ROLLBACK`
      throw error
    }
  } catch (error) {
    console.error('Error updating prices:', error)
    return NextResponse.json(
      { error: 'Failed to update prices' },
      { status: 500 }
    )
  }
}
