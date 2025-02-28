'use client'
import { useState } from 'react'

interface Stock {
  id: number
  name: string
  symbol: string
  current_price: number
  available_supply: number
  total_supply: number
}

interface TradeModalProps {
  stock: Stock
  isOpen: boolean
  onClose: () => void
}

export default function TradeModal({ stock, isOpen, onClose }: TradeModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')

  const totalCost = quantity * stock.current_price

  const handleTrade = async () => {
    try {
      // Record the trade interaction
      await fetch(`/api/stocks/${stock.id}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: tradeType })
      })

      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockId: stock.id,
          quantity,
          tradeType,
        }),
      })

      if (!response.ok) throw new Error('Trade failed')
      onClose()
    } catch (error) {
      console.error('Error executing trade:', error)
      alert('Failed to execute trade')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-[#1F2937] p-6 rounded-lg w-96 border border-[#374151]">
        <h2 className="text-xl font-bold mb-4">Trade {stock.name}</h2>
        
        <div className="mb-4">
          <div className="flex gap-2 mb-4">
            <button
              className={`flex-1 py-2 rounded ${
                tradeType === 'buy' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200'
              }`}
              onClick={() => setTradeType('buy')}
            >
              Buy
            </button>
            <button
              className={`flex-1 py-2 rounded ${
                tradeType === 'sell' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200'
              }`}
              onClick={() => setTradeType('sell')}
            >
              Sell
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              max={tradeType === 'buy' ? stock.available_supply : undefined}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600">Price per share: ${stock.current_price}</p>
            <p className="text-lg font-bold">Total: ${totalCost.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleTrade}
            className="flex-1 px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-700"
          >
            Confirm {tradeType}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
