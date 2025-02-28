'use client'
import { useState, useEffect } from 'react'

interface Prediction {
  id: number
  title: string
  description: string | null
  options: { [key: string]: string }
  end_time: string
  resolved: boolean
  winning_option?: string
  pool_distribution: { [key: string]: number }
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [selectedAmount, setSelectedAmount] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    fetchPredictions() // Initial fetch

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchPredictions()
    }, 30000)

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [])

  const fetchPredictions = async () => {
    try {
      const response = await fetch('/api/predictions')
      if (response.ok) {
        const data = await response.json()
        setPredictions(data)
      } else {
        console.error('Failed to fetch predictions:', await response.text())
      }
    } catch {
      console.error('Failed to fetch predictions')
    }
  }

  const placeBet = async (predictionId: number, option: string) => {
    const amount = parseFloat(selectedAmount[predictionId] || '0')
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    try {
      const response = await fetch('/api/predictions/bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          predictionId,
          amount,
          chosenOption: option,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to place bet')
      }

      // Refresh predictions
      fetchPredictions()
      // Clear bet amount
      setSelectedAmount(prev => ({ ...prev, [predictionId]: '' }))
      alert('Bet placed successfully!')
    } catch {
      alert('Failed to place bet')
    }
  }

  const getTotalPool = (distribution: { [key: string]: number }) => {
    return Object.values(distribution).reduce((a, b) => a + b, 0)
  }

  // Add this helper function to separate predictions
  const separatePredictions = (preds: Prediction[]) => {
    return {
      active: preds.filter(p => !p.resolved),
      resolved: preds.filter(p => p.resolved)
    }
  }

  const resolvePrediction = async (predictionId: number, winningOption: string) => {
    try {
      console.log('Attempting to resolve prediction:', { predictionId, winningOption })
      
      const response = await fetch('/api/predictions/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictionId, winningOption })
      })

      const data = await response.json()
      console.log('Server response:', data)
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to resolve prediction')
      }
      
      alert('Prediction resolved successfully!')
      await fetchPredictions()
    } catch {
      alert('Error resolving prediction')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Predictions</h1>
      </div>

      <div className="grid gap-6">
        {/* Active Predictions */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-semibold">Active Predictions</h2>
          {separatePredictions(predictions).active.map((prediction) => {
            const totalPool = getTotalPool(prediction.pool_distribution)
            return (
              <div key={prediction.id} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">{prediction.title}</h2>
                {prediction.description && (
                  <p className="text-gray-600 mb-4">{prediction.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {Object.entries(prediction.options).map(([key, value]) => {
                    const optionPool = prediction.pool_distribution[key] || 0
                    const odds = totalPool ? (totalPool / (optionPool || 1)).toFixed(2) : '2.00'
                    
                    return (
                      <div key={key} className="border rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{value}</span>
                          <span className="text-gray-600">x{odds}</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={selectedAmount[prediction.id] || ''}
                            onChange={(e) => setSelectedAmount(prev => ({
                              ...prev,
                              [prediction.id]: e.target.value
                            }))}
                            className="flex-1 px-3 py-1 border rounded"
                            placeholder="Amount"
                          />
                          <button
                            onClick={() => placeBet(prediction.id, key)}
                            className="px-4 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            Bet
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="text-sm text-gray-500">
                  Total Pool: ${totalPool.toFixed(2)} | 
                  Ends: {new Date(prediction.end_time).toLocaleString()}
                </div>
              </div>
            )
          })}
          {separatePredictions(predictions).active.length === 0 && (
            <p className="text-gray-500 text-center py-4">No active predictions</p>
          )}
        </div>

        {/* Resolved Predictions */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Resolved Predictions</h2>
          {separatePredictions(predictions).resolved.map((prediction) => (
            <div key={prediction.id} className="bg-white rounded-lg shadow p-6 opacity-75">
              <h2 className="text-xl font-semibold mb-2">{prediction.title}</h2>
              <p className="text-gray-600 mb-4">{prediction.description}</p>
              <p className="text-sm text-gray-500 mb-4">
                Ended: {new Date(prediction.end_time).toLocaleString()}
              </p>
              <div className="mt-4 text-green-600 font-medium">
                Resolved: {prediction.options[prediction.winning_option!]} Won
              </div>
            </div>
          ))}
          {separatePredictions(predictions).resolved.length === 0 && (
            <p className="text-gray-500 text-center py-4">No resolved predictions</p>
          )}
        </div>
      </div>
    </div>
  )
}
