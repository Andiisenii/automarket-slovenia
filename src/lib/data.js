// Data helpers - fetches from MySQL API
import { API_URL } from './api'

// Cache for API data
let brandsCache = null
let citiesCache = null
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Get all brands with models from API
export const getAllBrands = async () => {
  // Check cache first
  const now = Date.now()
  if (brandsCache && (now - lastFetchTime) < CACHE_DURATION) {
    return brandsCache.map(b => b.name)
  }
  
  try {
    const response = await fetch(`${API_URL}/brands.php?action=all`, {
      headers: { 'X-Pinggy-No-Screen': 'true' }
    })
    const data = await response.json()
    brandsCache = data
    lastFetchTime = now
    return data.map(b => b.name)
  } catch (error) {
    console.error('Error fetching brands:', error)
    return []
  }
}

// Get brands with models from API
export const getBrandsWithModels = async () => {
  const now = Date.now()
  if (brandsCache && (now - lastFetchTime) < CACHE_DURATION) {
    return brandsCache
  }
  
  try {
    const response = await fetch(`${API_URL}/brands.php?action=all`, {
      headers: { 'X-Pinggy-No-Screen': 'true' }
    })
    const data = await response.json()
    brandsCache = data
    lastFetchTime = now
    return data
  } catch (error) {
    console.error('Error fetching brands:', error)
    return []
  }
}

// Get models for a specific brand
export const getModelsForBrand = async (brand) => {
  if (!brand) return []
  
  try {
    const response = await fetch(`${API_URL}/brands.php?action=models&brand=${encodeURIComponent(brand)}`, {
      headers: { 'X-Pinggy-No-Screen': 'true' }
    })
    const models = await response.json()
    // API returns array of objects like {name: "Ferrari"}, convert to strings
    if (Array.isArray(models)) {
      return models.map(m => typeof m === 'string' ? m : m.name)
    }
    return []
  } catch (error) {
    console.error('Error fetching models:', error)
    return []
  }
}

// Get all models (all brands combined) - returns object with brand as key
export const getAllModels = async () => {
  const brandsWithModels = await getBrandsWithModels()
  const models = {}
  brandsWithModels.forEach(brand => {
    models[brand.name] = brand.models || []
  })
  return models
}

// Get all cities from API
export const getAllCities = async () => {
  const now = Date.now()
  if (citiesCache && (now - lastFetchTime) < CACHE_DURATION) {
    return citiesCache
  }
  
  try {
    const response = await fetch(`${API_URL}/cities.php?action=all`, {
      headers: { 'X-Pinggy-No-Screen': 'true' }
    })
    const data = await response.json()
    // API returns array of strings like ["Ljubljana", "Maribor"], not objects
    citiesCache = Array.isArray(data) ? data : []
    return citiesCache
  } catch (error) {
    console.error('Error fetching cities:', error)
    return []
  }
}

// Clear cache (useful when data is updated)
export const clearDataCache = () => {
  brandsCache = null
  citiesCache = null
  lastFetchTime = 0
}

// Static exports for components that need immediate data (without async)
export const brands = {} // Will be populated dynamically
export const defaultModels = {} // Will be populated dynamically

// Simple array of city names (for backwards compatibility)
export const slovenianCities = ['Ljubljana', 'Maribor', 'Celje', 'Koper', 'Kranj', 'Novo Gorica', 'Velenje', 'Nova Gorica', 'Kr�ko', 'Slovenska Bistrica', 'Ptuj', 'Murska Sobota', 'Kamnik', 'Dom�ale', '�kofja Loka', 'Lendava', 'Lenart', 'Roga�ka Slatina', 'Zrece', 'Portoro�', 'Bled', 'Bohinj', 'Kranjska Gora', 'Lucija', 'Izola', 'Ankaran', 'Ajdov�cina', 'Idrija', 'Vrhnika', 'Logatec', 'Postojna', 'Piran', 'Bre�ice', 'Kr�ko', 'Sevnica', 'Trbovlje', 'Zagreb', 'Celje', 'Koper', 'Ravne na Koro�kem'] // Will be populated dynamically

// Re-export for convenience
export const fuelTypes = ['Bencin', 'Dizel', 'Hybrid', 'Električni', 'Plin (LPG)']
export const transmissions = ['Avtomatski', 'Ročni', 'Polavtomatski', 'CVT']
export const bodyTypes = ['SUV', 'Sedan', 'Hatchback', 'Kupe', 'Kombi', 'Van', 'Pickup', 'Minivan']
export const colors = ['Bela', 'Črna', 'Siva', 'Rdeča', 'Modra', 'Zelena', 'Rumena', 'Oranžna', 'Rjava', 'Bež']

export const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic Listing',
    price: 5,
    duration: 30,
    features: [
      'Standard placement',
      'Basic stats',
      '5 photos included',
    ],
  },
  {
    id: 'featured',
    name: 'Featured Listing',
    price: 12,
    duration: 30,
    popular: true,
    features: [
      'Homepage placement',
      'Priority in search',
      '10 photos included',
      'Basic stats',
    ],
  },
  {
    id: 'premium',
    name: 'Premium Listing',
    price: 20,
    duration: 30,
    features: [
      'Homepage & search priority',
      'Highlighted listing',
      '20 photos included',
      'Advanced analytics',
      'Social media promotion',
    ],
  },
]

export const promotionPackages = [
  { id: '24h', name: '24 Hours', price: 3, duration: 1 },
  { id: '7d', name: '7 Days', price: 10, duration: 7 },
  { id: '30d', name: '30 Days', price: 25, duration: 30 },
]

export const companyInfo = {
  name: 'AutoMarket d.o.o.',
  address: 'Celovška cesta 100',
  city: 'Ljubljana',
  postalCode: '1000',
  country: 'Slovenija',
  phone: '+386 1 234 5678',
  email: 'info@automarket.si',
  website: 'www.automarket.si',
  taxId: 'SI12345678',
}

export const LUXURY_CAR_THRESHOLD = 30000
export const LUXURY_FEE = 10
