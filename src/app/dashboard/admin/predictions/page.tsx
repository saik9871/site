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

export default function AdminPredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    option1: '',
    option2: '',
    endTime: ''
  })

  useEffect(() => {
    fetchPredictions()

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
    } catch (error) {
      console.error('Error fetching predictions:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          options: {
            option1: formData.option1,
            option2: formData.option2
          },
          endTime: new Date(formData.endTime).toISOString()
        }),
      })

      if (!response.ok) throw new Error('Failed to create prediction')

      setFormData({
        title: '',
        description: '',
        option1: '',
        option2: '',
        endTime: ''
      })

      alert('Prediction created successfully!')
      fetchPredictions()
    } catch (error) {
      alert('Failed to create prediction')
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
    } catch (error: any) {
      console.error('Resolution error details:', {
        message: error.message,
        error
      })
      alert(error.message || 'Error resolving prediction')
    }
  }

  const separatePredictions = (preds: Prediction[]) => {
    return {
      active: preds.filter(p => !p.resolved),
      resolved: preds.filter(p => p.resolved)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Predictions Admin</h1>

      {/* Create Prediction Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Prediction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Option 1</label>
            <input
              type="text"
              value={formData.option1}
              onChange={(e) => setFormData(prev => ({ ...prev, option1: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Option 2</label>
            <input
              type="text"
              value={formData.option2}
              onChange={(e) => setFormData(prev => ({ ...prev, option2: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            Create Prediction
          </button>
        </form>
      </div>

      {/* Active Predictions */}
      <div className="space-y-6 mb-8">
        <h2 className="text-xl font-semibold">Active Predictions</h2>
        {separatePredictions(predictions).active.map((prediction) => (
          <div key={prediction.id} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">{prediction.title}</h2>
            <p className="text-gray-600 mb-4">{prediction.description}</p>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">Resolve Prediction</h3>
              <div className="flex gap-2">
                {Object.entries(prediction.options).map(([key, value]: [string, string]) => (
                  <button
                    key={key}
                    onClick={() => resolvePrediction(prediction.id, key)}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    {value} Wins
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
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
  )
}
