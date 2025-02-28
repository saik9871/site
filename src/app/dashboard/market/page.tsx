'use client'
import { useState, useEffect } from 'react'
import TradeModal from '@/components/TradeModal'
import StockDetail from '@/components/StockDetail'

export default function MarketPage() {
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false)
  const [stocks, setStocks] = useState<any[]>([])
  const [selectedStockForDetail, setSelectedStockForDetail] = useState<any>(null)

  useEffect(() => {
    const fetchStocks = async () => {
      const response = await fetch('/api/stocks', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setStocks(data)
      }
    }
    fetchStocks()

    // Set up periodic updates
    const interval = setInterval(() => {
      fetch('/api/stocks/update-prices', { method: 'POST' })
        .then(() => fetchStocks())
        .catch(console.error)
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold hover-glow">Market</h1>
        
        <div className="flex gap-4">
          <input
            type="search"
            placeholder="Search stocks..."
            className="modern-input"
          />
          <select className="modern-input">
            <option value="">Sort by</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="change">Change</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Stock</th>
              <th>Symbol</th>
              <th>Price</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock: any) => (
              <tr 
                key={stock.id} 
                className="cursor-pointer"
                onClick={() => setSelectedStockForDetail(stock)}
              >
                <td>{stock.name}</td>
                <td>{stock.symbol}</td>
                <td className="px-6 py-4 transition-colors duration-500">
                  ${parseFloat(stock.current_price).toFixed(2)}
                </td>
                <td>{stock.available_supply}/{stock.total_supply}</td>
                <td>
                  <button 
                    className="btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedStock(stock)
                      setIsTradeModalOpen(true)
                    }}
                  >
                    Trade
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedStockForDetail && (
        <StockDetail
          stock={selectedStockForDetail}
          onClose={() => setSelectedStockForDetail(null)}
          onTrade={() => {
            setSelectedStock(selectedStockForDetail)
            setIsTradeModalOpen(true)
            setSelectedStockForDetail(null)
          }}
        />
      )}

      {selectedStock && (
        <TradeModal
          stock={selectedStock}
          isOpen={isTradeModalOpen}
          onClose={() => {
            setIsTradeModalOpen(false)
            setSelectedStock(null)
          }}
        />
      )}
    </div>
  )
}
