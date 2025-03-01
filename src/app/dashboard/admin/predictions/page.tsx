'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Prediction {
  id: number;
  stock_id: number;
  prediction_type: string;
  target_price: number;
  deadline: string;
  status: string;
  created_at: string;
  stock_name?: string;
  stock_symbol?: string;
}

export default function AdminPredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch('/api/predictions');
        const data = await response.json();
        setPredictions(data);
      } catch (err) {
        console.error('Failed to fetch predictions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  const handleResolve = async (id: number, outcome: 'success' | 'failed') => {
    try {
      const response = await fetch('/api/predictions/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, outcome }),
      });

      if (response.ok) {
        // Refresh predictions after resolving
        const updatedResponse = await fetch('/api/predictions');
        const updatedData = await updatedResponse.json();
        setPredictions(updatedData);
      }
    } catch (err) {
      console.error('Failed to resolve prediction:', err);
    }
  };

  if (loading) {
    return <div className="p-4">Loading predictions...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Predictions Management</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Stock</th>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Target Price</th>
              <th className="px-4 py-2 border">Deadline</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((prediction) => (
              <tr key={prediction.id}>
                <td className="px-4 py-2 border">
                  {prediction.stock_symbol} ({prediction.stock_name})
                </td>
                <td className="px-4 py-2 border">{prediction.prediction_type}</td>
                <td className="px-4 py-2 border">${prediction.target_price.toFixed(2)}</td>
                <td className="px-4 py-2 border">
                  {new Date(prediction.deadline).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border">{prediction.status}</td>
                <td className="px-4 py-2 border">
                  {prediction.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResolve(prediction.id, 'success')}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Success
                      </button>
                      <button
                        onClick={() => handleResolve(prediction.id, 'failed')}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Failed
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

