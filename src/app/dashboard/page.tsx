'use client'
import { useState, useEffect } from 'react'

interface Holding {
  quantity: number
  purchase_price: number
  name: string
  symbol: string
  current_price: number
}

interface UserData {
  user: {
    username: string
    balance: string
    role: string
  }
  holdings: Holding[]
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch('/api/user')
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      }
    }
    fetchUserData()
  }, [])

  const calculatePortfolioValue = (holdings: Holding[]) => {
    return holdings.reduce((total, holding) => {
      return total + (holding.quantity * holding.current_price)
    }, 0)
  }

  const calculateTotalProfit = (holdings: Holding[]) => {
    return holdings.reduce((total, holding) => {
      const investmentCost = holding.quantity * holding.purchase_price
      const currentValue = holding.quantity * holding.current_price
      return total + (currentValue - investmentCost)
    }, 0)
  }

  if (!userData) return <div>Loading...</div>

  const portfolioValue = userData.holdings.length ? calculatePortfolioValue(userData.holdings) : 0
  const totalProfit = userData.holdings.length ? calculateTotalProfit(userData.holdings) : 0

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="grid gap-6">
        {/* User Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Account Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="text-xl font-semibold">{userData.user.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-xl font-semibold">${parseFloat(userData.user.balance).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Portfolio Value</p>
              <p className="text-xl font-semibold">${portfolioValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Profit/Loss</p>
              <p className={`text-xl font-semibold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Portfolio */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-lg font-semibold p-6 pb-4">Portfolio</h2>
          {userData.holdings.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit/Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {userData.holdings.map((holding) => {
                  const profitLoss = (holding.current_price - holding.purchase_price) * holding.quantity
                  return (
                    <tr key={holding.symbol} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{holding.name}</div>
                          <div className="text-sm text-gray-500">{holding.symbol}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{holding.quantity}</td>
                      <td className="px-6 py-4">${holding.purchase_price}</td>
                      <td className="px-6 py-4">${holding.current_price}</td>
                      <td className={`px-6 py-4 ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 p-6">No stocks owned yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
