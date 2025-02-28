'use client'
import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface PriceData {
  timestamp: number
  price: number
}

interface StockDetailProps {
  stock: {
    id: number
    name: string
    symbol: string
    current_price: number
    available_supply: number
    total_supply: number
  }
  onClose: () => void
  onTrade: () => void
}

export default function StockDetail({ stock, onClose, onTrade }: StockDetailProps) {
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPriceHistory()
    
    // Record view when stock detail is opened
    fetch(`/api/stocks/${stock.id}/interact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'view' })
    }).catch(console.error)
  }, [stock.id])

  const fetchPriceHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/stocks/${stock.id}/history`)
      if (!response.ok) throw new Error('Failed to fetch price history')
      
      const data = await response.json()
      setPriceHistory(data)
    } catch (error) {
      console.error('Error fetching price history:', error)
      // Set a fallback single data point if fetch fails
      setPriceHistory([{
        timestamp: Date.now(),
        price: stock.current_price
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-[#1F2937] p-6 rounded-lg w-[800px] max-w-full border border-[#374151]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{stock.name} ({stock.symbol})</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <div className="text-2xl font-bold">${stock.current_price}</div>
          <div className="text-sm text-gray-500">
            Available: {stock.available_supply}/{stock.total_supply}
          </div>
        </div>

        <div className="h-[400px] mb-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Loading price history...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  type="number"
                  tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                  stroke="#9CA3AF"
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    color: '#F3F4F6'
                  }}
                  labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                  formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8B5CF6" 
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onTrade}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Trade
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
