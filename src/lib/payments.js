import { API_URL } from './api'

// Payment packages
export const paymentPackages = [
  {
    id: 'basic',
    name: 'Basic',
    price: 5,
    description: 'Standard listing for 30 days',
    features: ['Standard placement', '5 photos', 'Basic stats']
  },
  {
    id: 'featured',
    name: 'Featured',
    price: 12,
    description: 'Featured listing for 30 days',
    features: ['Homepage placement', '10 photos', 'Priority in search', 'Basic stats'],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 20,
    description: 'Premium listing for 30 days',
    features: ['Homepage & search priority', '20 photos', 'Advanced analytics', 'Social media promotion']
  }
]

// Boost packages for cars
export const boostPackages = [
  { id: 'akcija', name: 'Akcija', price: 5, days: 7 },
  { id: 'top', name: 'Top', price: 10, days: 14 },
  { id: 'skok', name: 'Skok', price: 15, days: 30 },
]

// Create payment
export async function createPayment(userId, carId, packageId) {
  const pkg = paymentPackages.find(p => p.id === packageId) || boostPackages.find(p => p.id === packageId)
  
  if (!pkg) {
    return { error: 'Package not found' }
  }
  
  try {
    const response = await fetch(`${API_URL}/payments.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Pinggy-No-Screen': 'true' },
      body: JSON.stringify({
        action: 'create',
        user_id: userId,
        car_id: carId,
        amount: pkg.price,
        package: packageId
      })
    })
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Payment error:', error)
    return { success: false, message: 'Payment failed' }
  }
}

// Get user payments
export async function getUserPayments(userId) {
  try {
    const response = await fetch(`${API_URL}/payments.php?user_id=${userId}`, {
      headers: { 'X-Pinggy-No-Screen': 'true' }
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Get payments error:', error)
    return { success: false, payments: [] }
  }
}

// Get car payment
export async function getCarPayment(carId) {
  try {
    const response = await fetch(`${API_URL}/payments.php?car_id=${carId}`, {
      headers: { 'X-Pinggy-No-Screen': 'true' }
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Get car payment error:', error)
    return { success: false }
  }
}
