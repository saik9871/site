'use client'
import { useState, useEffect } from 'react'

interface Stock {
  id: number
  name: string
  symbol: string
  current_price: number
  total_supply: number
  available_supply: number
}

export default function StockManagementPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [editingStock, setEditingStock] = useState<Stock | null>(null)
  const [newStock, setNewStock] = useState({
    name: '',
    symbol: '',
    initialPrice: '',
    totalSupply: ''
  })
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    fetchStocks()
  }, [])

  const fetchStocks = async () => {
    const response = await fetch('/api/stocks')
    if (response.ok) {
      const data = await response.json()
      setStocks(data)
    }
  }

  const handleCreateStock = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStock.name,
          symbol: newStock.symbol,
          initialPrice: parseFloat(newStock.initialPrice),
          totalSupply: parseInt(newStock.totalSupply)
        })
      })

      if (response.ok) {
        setNewStock({ name: '', symbol: '', initialPrice: '', totalSupply: '' })
        fetchStocks()
      }
    } catch (error) {
      console.error('Error creating stock:', error)
    }
  }

  const handleUpdateStock = async (stock: Stock) => {
    try {
      const response = await fetch(`/api/stocks/${stock.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stock)
      })

      if (response.ok) {
        setEditingStock(null)
        fetchStocks()
      }
    } catch (error) {
      console.error('Error updating stock:', error)
    }
  }

  const handleDeleteStock = async (stockId: number) => {
    try {
      const response = await fetch(`/api/stocks/${stockId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDeleteConfirm(null)
        fetchStocks()
      }
    } catch (error) {
      console.error('Error deleting stock:', error)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Stock Management</h1>

      {/* Create Stock Form */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Stock</h2>
        <form onSubmit={handleCreateStock} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Stock Name"
            value={newStock.name}
            onChange={(e) => setNewStock(prev => ({ ...prev, name: e.target.value }))}
            className="input"
            required
          />
          <input
            type="text"
            placeholder="Symbol"
            value={newStock.symbol}
            onChange={(e) => setNewStock(prev => ({ ...prev, symbol: e.target.value }))}
            className="input"
            required
          />
          <input
            type="number"
            placeholder="Initial Price"
            value={newStock.initialPrice}
            onChange={(e) => setNewStock(prev => ({ ...prev, initialPrice: e.target.value }))}
            className="input"
            step="0.01"
            min="0.01"
            required
          />
          <input
            type="number"
            placeholder="Total Supply"
            value={newStock.totalSupply}
            onChange={(e) => setNewStock(prev => ({ ...prev, totalSupply: e.target.value }))}
            className="input"
            min="1"
            required
          />
          <button type="submit" className="btn col-span-2">
            Create Stock
          </button>
        </form>
      </div>

      {/* Stocks Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Symbol</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Supply</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map(stock => (
              <tr key={stock.id} className="border-t border-[var(--border)]">
                <td className="p-4">{stock.name}</td>
                <td className="p-4">{stock.symbol}</td>
                <td className="p-4">${stock.current_price}</td>
                <td className="p-4">{stock.available_supply}/{stock.total_supply}</td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => setEditingStock(stock)}
                    className="btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(stock.id)}
                    className="btn bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="card w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Stock</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={editingStock.name}
                onChange={(e) => setEditingStock(prev => ({ ...prev!, name: e.target.value }))}
                className="input w-full"
                placeholder="Stock Name"
              />
              <input
                type="number"
                value={editingStock.current_price}
                onChange={(e) => setEditingStock(prev => ({ ...prev!, current_price: parseFloat(e.target.value) }))}
                className="input w-full"
                placeholder="Price"
                step="0.01"
              />
              <input
                type="number"
                value={editingStock.total_supply}
                onChange={(e) => setEditingStock(prev => ({ ...prev!, total_supply: parseInt(e.target.value) }))}
                className="input w-full"
                placeholder="Total Supply"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStock(editingStock)}
                  className="btn flex-1"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingStock(null)}
                  className="btn flex-1 bg-red-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="card w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this stock? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDeleteStock(deleteConfirm)}
                className="btn flex-1 bg-red-500 hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
