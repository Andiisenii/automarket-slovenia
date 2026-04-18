// Data helpers - fetches from Supabase only
// Supabase configuration
const SUPABASE_URL = 'https://pajbxchnenouxeaimsdr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_CQVFr7jAHNfQV5DXvxQiZg_h7Cq6MRH'

// Cache for API data
let brandsCache = null
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Supabase fetch helper
const getFromSupabase = async (table, select = '*') => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    })
    return await response.json()
  } catch (error) {
    console.warn('Supabase fetch failed:', error)
    return null
  }
}

// Get all brands
export const getAllBrands = async () => {
  const now = Date.now()
  if (brandsCache && (now - lastFetchTime) < CACHE_DURATION) {
    return brandsCache.map(b => b.name || b)
  }
  
  const brands = await getFromSupabase('brands', 'id,name')
  if (brands && brands.length > 0) {
    brandsCache = brands
    lastFetchTime = now
    return brands.map(b => b.name)
  }
  
  return []
}

// Get brands with models
export const getBrandsWithModels = async () => {
  const now = Date.now()
  if (brandsCache && (now - lastFetchTime) < CACHE_DURATION) {
    return brandsCache
  }
  
  const brands = await getFromSupabase('brands', 'id,name')
  if (brands && brands.length > 0) {
    brandsCache = brands
    lastFetchTime = now
    return brands
  }
  
  return []
}

// Get models for a specific brand
export const getModelsForBrand = async (brand) => {
  if (!brand) return []
  
  const brands = await getFromSupabase('brands', 'id,name')
  if (brands && brands.length > 0) {
    const brandData = brands.find(b => b.name === brand)
    if (brandData) {
      const models = await getFromSupabase('models', 'name,brand_id')
      if (models && models.length > 0) {
        return models.filter(m => m.brand_id === brandData.id).map(m => m.name)
      }
    }
  }
  
  return []
}

// Get all cities
export const getAllCities = async () => {
  const cities = await getFromSupabase('cities', 'name')
  if (cities && cities.length > 0) {
    return cities.map(c => c.name)
  }
  return []
}

// Fuel types
export const fuelTypes = ['Bencin', 'Dizel', 'Hybrid', 'Električni', 'Plin (LPG)']

// Transmissions
export const transmissions = ['Avtomatski', 'Ročni', 'Polavtomatski']

// Body types
export const bodyTypes = ['Traktor', 'Limuzina', 'Hatchback', 'Coupe', 'Kombi', 'Van', 'Pickup', 'Minivan', 'Kabriolet', 'Roadster', 'Targa', 'Fastback', 'Liftback', 'Sportni coupe', 'SUV']

// Door counts
export const doorCounts = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30+']

// Colors
export const colors = ['Bela', 'Črna', 'Siva', 'Rdeča', 'Modra', 'Zelena', 'Rumena', 'Oranžna', 'Rjava', 'Bež']

// Vehicle condition options
export const vehicleConditionOptions = [
  { value: 'Vozno', label: 'Vozno', description: 'NEpoškodovano, Ni karambolirano' },
  { value: 'NEvozno', label: 'NEvozno', description: 'poškodovano, karambolirano' },
  { value: 'V_okvari', label: 'V okvari', description: 'vendar NI karambolirano' },
]

// Vehicle condition sub options
export const vehicleConditionSubOptions = {
  'Vozno': [
    { id: 'neposkodovano', label: 'NEpoškodovano' },
    { id: 'ni_karambolirano', label: 'Ni karambolirano' },
  ],
  'NEvozno': [
    { id: 'poskodovano', label: 'poškodovano' },
    { id: 'karambolirano', label: 'karambolirano' },
  ],
  'V_okvari': [
    { id: 'poplavljeno', label: 'vozilo je bilo poplavijeno' },
    { id: 'dikalnik', label: 'dirkalno vozilo' },
  ],
}

// Emission classes
export const emissionClasses = ['Euro 1', 'Euro 2', 'Euro 3', 'Euro 4', 'Euro 5', 'Euro 6', 'Euro 6d', 'Euro 6e', 'Euro 6e-TEMP']

// Garancija options
export const garancijaOptions = [
  { value: 'brez_garancije', label: 'Brez garancije' },
  { value: '1_leto', label: '1 leto' },
  { value: '2_leti', label: '2 leti' },
  { value: '3_leta', label: '3 leta' },
  { value: '4_leta', label: '4 leta' },
  { value: '5_let', label: '5 let ali več' },
  { value: 'po_dogovoru', label: 'Po dogovoru' },
  { value: 'ustrezen_garancijski_list', label: 'Ustrezen garancijski list' },
  { value: 'neustrezen_garancijski_list', label: 'Neustrezen garancijski list' },
]

// Registration options
export const registracijaOptions = [
  { value: 'veljavna_registracija', label: 'Veljavna registracija' },
  { value: 'potekla_registracija', label: 'Potekla registracija' },
]

// Vehicle age options
export const vehicleAgeOptions = [
  { value: '0-1', label: '0-1 leto' },
  { value: '1-2', label: '1-2 leti' },
  { value: '2-3', label: '2-3 leta' },
  { value: '3-5', label: '3-5 let' },
  { value: '5-8', label: '5-8 let' },
  { value: '8-10', label: '8-10 let' },
  { value: '10+', label: '10+ let' },
]

// Owner count options
export const ownerCountOptions = [
  { value: '1', label: '1 lastnik' },
  { value: '2', label: '2 lastnika' },
  { value: '3', label: '3 lastniki' },
  { value: '3+', label: '3+ lastniki' },
]

// Months
export const months = [
  'Januar', 'Februar', 'Marec', 'April', 'Maj', 'Junij',
  'Julij', 'Avgust', 'September', 'Oktober', 'November', 'December'
]

// Get years for dropdown
export const getYears = (startYear = 1990, endYear = 2026) => {
  const years = []
  for (let y = endYear; y >= startYear; y--) {
    years.push(y)
  }
  return years
}

// Export empty arrays for compatibility - data comes from Supabase now
export const FALLBACK_BRANDS = []
export const FALLBACK_MODELS = {}

// Luxury car threshold and fee
export const LUXURY_CAR_THRESHOLD = 50000
export const LUXURY_FEE = 5

// Slavenian cities
export const slovenianCities = [
  'Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Koper', 'Nova Gorica',
  'Krško', 'Novo Mesto', 'Ptuj', 'Trbovlje', 'Kamnik', 'Jesenice', 'Žalec',
  'Žirovnica', 'Bled', 'Bohinj', 'Brežice', 'Cerklje ob Krki', 'Cerknica',
  'Cerkno', 'Crnomelj', 'Dravograd', 'Gornja Radgona', 'Grosuplje', 'Hrastnik',
  'Idrija', 'Ilirska Bistrica', 'Izola', 'Jurovski Dol', 'Kanal ob Soči',
  'Kočevje', 'Komen', 'Kozina', 'Kranjska Gora', 'Lendava', 'Litija', 'Logatec',
  'Metlika', 'Mežica', 'Murska Sobota', 'Muta', 'Nazaret', 'Ormož', 'Piran',
  'Postojna', 'Prevalje', 'Radeče', 'Radlje ob Dravi', 'Radovljica', 'Ravne na Koroškem',
  'Ribnica', 'Rogaška Slatina', 'Rogatec', 'Ruše', 'Sežana', 'Slovenska Bistrica',
  'Slovenske Konjice', 'Šentjur', 'Škofja Loka', 'Šmarje pri Jelšah', 'Tolmin',
  'Trebnje', 'Tržič', 'Turnišče', 'Velenje', 'Vinica', 'Vipava', 'Vitanje',
  'Vodice', 'Vožec', 'Zagorje ob Savi', 'Zavrč', 'Zreče', 'Železniki'
]

// Brands and default models - empty, data from Supabase
export const brands = []
export const defaultModels = {}

// Car equipment categories
export const carEquipmentCategories = [
  {
    id: 'varnost',
    name: 'Varnost',
    items: ['ABS', 'ESP', 'Airbag spredaj', 'Airbag nazaj', 'Airbag stransko', 'Alarm', 'Vsodilnik za sledenje']
  },
  {
    id: 'udobje',
    name: 'Udobje',
    items: ['Klima', 'Avtomatska klima', 'Greteks', 'Sedeži z ogrevanjem', 'Sedeži z prezračevanjem', 'Električni pomik sedežev', 'Šiborna okna', 'Električna vrtljiva ogledala', 'Centralno zaklepanje', 'SMEMA', 'Tempomat', 'Pomoč pri parkiranju']
  },
  {
    id: 'multimedija',
    name: 'Multimedija',
    items: ['Radio', 'Navigacija', 'Bluetooth', 'USB', 'Android Auto', 'Apple CarPlay', 'DAB+']
  },
]
