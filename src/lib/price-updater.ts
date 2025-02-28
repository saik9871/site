export async function updatePrices() {
  try {
    const response = await fetch('/api/stocks/update-prices', {
      method: 'POST'
    })
    
    if (!response.ok) {
      throw new Error('Failed to update prices')
    }
  } catch (error) {
    console.error('Error in price update:', error)
  }
}
