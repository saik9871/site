'use client'
import { useState, useEffect } from 'react'

interface LeaderboardEntry {
  username: string
  total_value: string
  daily_profit_loss: string
  total_profit_loss: string
  rank: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
    // Refresh every minute
    const interval = setInterval(fetchLeaderboard, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data)
      } else {
        console.error('Failed to fetch leaderboard')
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
        <div className="text-center py-8">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily P/L</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total P/L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaderboard.map((entry) => (
              <tr key={entry.username} className="hover:bg-gray-50">
                <td className="px-6 py-4">#{entry.rank}</td>
                <td className="px-6 py-4">{entry.username}</td>
                <td className="px-6 py-4">${parseFloat(entry.total_value).toFixed(2)}</td>
                <td className={`px-6 py-4 ${parseFloat(entry.daily_profit_loss) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(entry.daily_profit_loss) >= 0 ? '+' : ''}
                  ${parseFloat(entry.daily_profit_loss).toFixed(2)}
                </td>
                <td className={`px-6 py-4 ${parseFloat(entry.total_profit_loss) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(entry.total_profit_loss) >= 0 ? '+' : ''}
                  ${parseFloat(entry.total_profit_loss).toFixed(2)}
                </td>
              </tr>
            ))}
            {leaderboard.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
