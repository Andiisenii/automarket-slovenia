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
// Stanje vozila - radio buttons (mutually exclusive)
export const vehicleConditionOptions = [
  { value: 'Vozno', label: 'Vozno', description: 'NEpoškodovano, Ni karambolirano' },
  { value: 'NEvozno', label: 'NEvozno', description: 'poškodovano, karambolirano' },
  { value: 'V_okvari', label: 'V okvari', description: 'vendar NI karambolirano' },
]

// Stanje podtips (checkboxes that depend on main selection)
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

// Nova struktura opreme - checkboxes by category
export const carEquipmentCategories = {
  notranjost: {
    name: 'Notranjost',
    icon: 'car',
    subcategories: {
      udobje: {
        name: 'Udobje',
        features: [
          'Virtualni Cockpit',
          'Ambientna osvetlitev notranjosti',
          'Leseni dodatki notranjosti',
          'ALU dodatki notranjosti',
          'Karbonski dodatki notranjosti',
          'Krom dodatki notranjosti',
          'Paket za kadilce',
          'Sportni sedezi',
          'Komfortni sedezi',
          'Ortopedski sedezi',
          '12V vticnica',
          'Klimatska naprava - rocna',
          'Sedeži: nastavitev po visini',
          'Sedeži: el. nastavitev',
          'Sedeži: paket Memory',
          'Sedeži: gretje spreda',
          'Sedeži: gretje zadaj',
          'Sedeži: hlajenje / ventilacija',
          'Sedeži: masazna funkcija',
          'Sredinski naslon za roko med sedezi',
          'Hladilni predal',
          'Avtomatska klimatska naprava / digitalna',
          'Klimatska naprava - 2 conska',
          'Klimatska naprava - 3 conska',
          'Klimatska naprava - 4 conska',
          'Gretje mirujocega vozila (Webasto)',
          'Tonirana stekla',
          'Elektricni pomik prednjih stekel',
          'Elektricni pomik prednjih in zadnjih stekel',
          'El. nastavijiva zunanja ogledala',
          'Ogrevanje zunanjih ogledal',
          'El. zlozijiva zunanja ogledala',
          'Centralno zaklepanje',
          'Centralno zaklepanje z daljinskim',
          'Soft-Close sistem zapiranja',
          'Sencni rolo za zadnje steklo',
          'Keyless Go',
          'Start-Stop sistem',
          'Elektricni paket',
          'Nastavijiv volan po visini',
          'Nastavijiv volan po globini',
          'Servo volan',
          'Volanski obroc oblecen v usnje',
          'Multifunkcijski volan',
          'Sportni volan',
          'Ogrevan volanski obroc',
          'Obvolanski prestavni rocici',
          'Tempomat',
          'Aktivni tempomat (Adaptive Cruise Control)',
          'El. parkima zavora',
          'El. zapiranje prtljaznika',
          'Ogrevano vetrobransko steklo',
        ]
      }
    }
  },
  info_multimedia: {
    name: 'Info-Multimedia',
    icon: 'radio',
    subcategories: {
      avtoradio: {
        name: 'Avtoradio',
        features: [
          'Avtoradio',
          'Avtoradio / CD',
          'Hi-Fi ozvocenje',
          'CD izmenjevalnik / strežnik',
          'MP3 predvajalnik',
          'DVD predvajalnik',
          'Trdi disk za shranjevanje podatkov',
          'USB prikljucek (iPod, HD...)',
          'TV sprejemnik / tuner',
          'Bluetooth vmesnik',
          'Apple CarPlay',
          'Android Auto',
          'Digitalni radio DAB',
          'Navigacija',
          'Navigacija + TV',
          'Touch screen',
        ]
      }
    }
  },
  uporabnost: {
    name: 'Uporabnost',
    icon: 'settings',
    subcategories: {
      uporabnost_main: {
        name: 'Uporabnost',
        features: [
          'Deljiva zad.klop 1/2 - 1/2',
          'Deljiva zad.klop 1/3 - 2/3',
          'Deljiva zad.klop 1/3-1/3-1/3',
          'Isofix sistem za pritrditev sedeza',
          'Integrirani otroški sedez',
          'Vreca za smuci',
          'Mrezasta pregrada tovornega prostora',
          'Rolo prijaznega prostora',
          'Navodila za uporabo v SLO jeziku',
          'Dvojno dno prtljaznika',
          'Strešne sani',
          'Predpriprava za mobilni telefon',
          'Avtatelefon',
          'Potovalni racunalnik',
          'Komunikacijski paket',
          'Pomoc pri speljevanju v klanec',
          'Sistem za aktivno pomoc pri parkiranju',
          'Parkimi senzorji PDC',
          'Pomoc pri parkiranju: kamera',
          'Pomoc pri parkiranju: prednji senzorji',
          'Pomoc pri parkiranju: zadnji senzorji',
          'Pomoc pri parkiranju: pogled 360 stopinj',
          'Vzratna kamera',
          'Bone stopnice',
          'Vlecna kijuka',
          'Vozilo priagojeno invalidu',
        ]
      }
    }
  },
  podvozje: {
    name: 'Podvozje',
    icon: 'settings-2',
    subcategories: {
      platisca: {
        name: 'Platisca',
        features: [
          'Platisca (ALU)',
        ]
      },
      zavorni_sistem: {
        name: 'Zavorni sistem',
        features: [
          'Zavorni sistem (ABS)',
          'Pomoc pri zaviranju (BAS / DBC / EBV)',
          'Samodejna zapora diferenciala (ASD / EDS)',
        ]
      },
      stabilnost: {
        name: 'Stabilnost',
        features: [
          'Elektronski program stabilnosti (ESP / DSC)',
          'Elektronski nadzor Blaiseilnikov (EDC)',
          'Regulacija nivoja podvozja (ADS)',
          'Stirikolesni volan (4WS / 4CONTROL)',
          'Regulacija zdrsa pogonskih koles (ASR / DTC)',
          'Elektronski sistem za bolisi opnijem koles ETS',
        ]
      },
      podvozje_vrsta: {
        name: 'Vrsta podvozja',
        features: [
          'Športno podvozje',
          'Aktivno vzmetenje (ABC - Active Body Control)',
          'Zracno vzmetenje',
          'Štirikolesni pogon (4x4 / 4WD / Quattro)',
        ]
      }
    }
  },
  varnost: {
    name: 'Varnost',
    icon: 'shield',
    subcategories: {
      airbag: {
        name: 'Stevilo airbagov',
        features: [
          'Airbag - voznik',
          'Airbag - sopotnik',
          'Airbag - stranski (vratni)',
          'Airbag - zavesni',
          'Airbag - kolenski',
        ]
      },
      svetila: {
        name: 'Žarometi in luci',
        features: [
          'Nadzor zracnega tlaka v pnevmatikah (RDK)',
          'Xenonski zarometi',
          'Bi-xenonski zarometi',
          'Samodejno upravljanje dolgih luzi',
          'LED zarometi',
          'Prednje (dnevne) LED luci',
          'Zadnje LED luci',
          'Meglenke',
          'Adaptive light / dinamicno prilagodijivi zarometi',
          '3. zavorna luc',
          'Naprava za pranie zarometov',
        ]
      },
      asistence: {
        name: 'Varnostni asistenti',
        features: [
          'Head-Up display',
          'Sistem za ohranjanje voznega pasu',
          'Sistem za opozarjanje na mrtvi kot',
          'Sistem za prepoznavo prometnih znakov',
          'Senzor za dez',
          'Sistem za samodejno zaviranje v sili',
          'Opozorilnik spremembe voznega pasu',
          'Opozorilnik varnostne razdalje',
        ]
      },
      zascita: {
        name: 'Zascita',
        features: [
          'Alarmna naprava',
          'Blokada motorja',
          'Kodno varovan vzign motorja',
        ]
      },
      pnevmatike: {
        name: 'Pnevmatike',
        features: [
          'Rezervno kolo normalne dimenzije',
          'Run-Flat pnevmatike',
        ]
      }
    }
  },
}

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

// ============ CAR FEATURES ============
// These are organized by category for better UI grouping
export const carFeatures = {
  safety: [
    { id: 1, name_sl: 'Airbag - voznik', name_en: 'Airbag - driver', icon: 'shield' },
    { id: 2, name_sl: 'Airbag - sopotnik', name_en: 'Airbag - passenger', icon: 'shield' },
    { id: 3, name_sl: 'Airbag - stranski', name_en: 'Side airbag', icon: 'shield' },
    { id: 4, name_sl: 'Airbag - zavese', name_en: 'Curtain airbag', icon: 'shield' },
    { id: 5, name_sl: 'ABS', name_en: 'ABS', icon: 'circle' },
    { id: 6, name_sl: 'ESP', name_en: 'ESP', icon: 'activity' },
    { id: 7, name_sl: 'ASR (traction control)', name_en: 'ASR (traction control)', icon: 'sliders' },
    { id: 8, name_sl: 'D SRC', name_en: 'D SRC', icon: 'alert-circle' },
    { id: 9, name_sl: 'Zavora za pomoč pri zaviranju', name_en: 'Brake assist', icon: 'anchor' },
    { id: 10, name_sl: 'Sistem za nadzor mrtvega kota', name_en: 'Blind spot monitoring', icon: 'eye' },
    { id: 11, name_sl: 'Sistem za ohranjanje voznega pasu', name_en: 'Lane keep assist', icon: 'git-branch' },
    { id: 12, name_sl: 'Sistem za zaznavanje utrujenosti', name_en: 'Fatigue detection', icon: 'alert-triangle' },
    { id: 13, name_sl: 'Sistem za preprečevanje trčenja', name_en: 'Collision prevention', icon: 'alert-octagon' },
    { id: 14, name_sl: 'Parkirni senzorji - spredaj', name_en: 'Parking sensors - front', icon: 'map-pin' },
    { id: 15, name_sl: 'Parkirni senzorji - zadaj', name_en: 'Parking sensors - rear', icon: 'map-pin' },
    { id: 16, name_sl: 'Parkirna kamera', name_en: 'Parking camera', icon: 'video' },
    { id: 17, name_sl: '360° kamera', name_en: '360° camera', icon: 'aperture' },
    { id: 18, name_sl: 'Tempomat', name_en: 'Cruise control', icon: 'gauge' },
    { id: 19, name_sl: 'Adaptivni tempomat', name_en: 'Adaptive cruise control', icon: 'gauge' },
  ],
  comfort: [
    { id: 20, name_sl: 'Klimatska naprava', name_en: 'Air conditioning', icon: 'thermometer' },
    { id: 21, name_sl: 'Avtomatska klimatska naprava', name_en: 'Automatic climate control', icon: 'thermometer' },
    { id: 22, name_sl: 'Dvo conska klimatska naprava', name_en: 'Dual zone climate control', icon: 'thermometer' },
    { id: 23, name_sl: 'Štiri conska klimatska naprava', name_en: 'Four zone climate control', icon: 'thermometer' },
    { id: 24, name_sl: 'Grete sedežev', name_en: 'Heated seats', icon: 'heart' },
    { id: 25, name_sl: 'Grete sedežev - spredaj', name_en: 'Heated front seats', icon: 'heart' },
    { id: 26, name_sl: 'Grete sedežev - zadaj', name_en: 'Heated rear seats', icon: 'heart' },
    { id: 27, name_sl: 'Grete volanskega obroča', name_en: 'Heated steering wheel', icon: 'circle' },
    { id: 28, name_sl: 'Ventralni sedež', name_en: 'Ventilated seats', icon: 'wind' },
    { id: 29, name_sl: 'Električno nastavljivi sedeži', name_en: 'Electric seats adjustment', icon: 'zap' },
    { id: 30, name_sl: 'Sedeži z pomnilnikom', name_en: 'Memory seats', icon: 'save' },
    { id: 31, name_sl: 'Električno odpiranje prtljažnika', name_en: 'Electric tailgate', icon: 'package' },
    { id: 32, name_sl: 'Panoramska streha', name_en: 'Panoramic sunroof', icon: 'sun' },
    { id: 33, name_sl: 'Strešno okno', name_en: 'Sunroof', icon: 'cloud' },
    { id: 34, name_sl: 'Soft close vrata', name_en: 'Soft close doors', icon: 'door-closed' },
    { id: 35, name_sl: 'Keyless entry', name_en: 'Keyless entry', icon: 'key' },
    { id: 36, name_sl: 'Keyless go', name_en: 'Keyless go', icon: 'log-in' },
    { id: 37, name_sl: 'Električno zložljiva ogledala', name_en: 'Electric folding mirrors', icon: 'square' },
    { id: 38, name_sl: 'Ogrevana ogledala', name_en: 'Heated mirrors', icon: 'thermometer' },
    { id: 39, name_sl: 'Ambientna osvetlitev', name_en: 'Ambient lighting', icon: 'sun' },
    { id: 40, name_sl: 'Notranji ambient - več barv', name_en: 'Multi-color ambient lighting', icon: 'palette' },
  ],
  technology: [
    { id: 41, name_sl: 'USB vhod', name_en: 'USB input', icon: 'smartphone' },
    { id: 42, name_sl: 'USB-C vhod', name_en: 'USB-C input', icon: 'smartphone' },
    { id: 43, name_sl: 'Bluetooth', name_en: 'Bluetooth', icon: 'bluetooth' },
    { id: 44, name_sl: 'Apple CarPlay', name_en: 'Apple CarPlay', icon: 'smartphone' },
    { id: 45, name_sl: 'Android Auto', name_en: 'Android Auto', icon: 'smartphone' },
    { id: 46, name_sl: 'Brezžično polnjenje', name_en: 'Wireless charging', icon: 'zap' },
    { id: 47, name_sl: 'Premium zvočni sistem', name_en: 'Premium audio system', icon: 'volume-2' },
    { id: 48, name_sl: 'Harman Kardon zvočniki', name_en: 'Harman Kardon speakers', icon: 'volume-2' },
    { id: 49, name_sl: 'DAB radio', name_en: 'DAB radio', icon: 'radio' },
    { id: 50, name_sl: 'Navigacijski sistem', name_en: 'Navigation system', icon: 'navigation' },
    { id: 51, name_sl: 'Head-up display', name_en: 'Head-up display', icon: 'monitor' },
    { id: 52, name_sl: 'Digitalna instrumentna plošča', name_en: 'Digital instrument cluster', icon: 'monitor' },
    { id: 53, name_sl: 'Touchscreen zaslon', name_en: 'Touchscreen display', icon: 'tablet' },
    { id: 54, name_sl: 'Wi-Fi hotspot', name_en: 'Wi-Fi hotspot', icon: 'wifi' },
    { id: 55, name_sl: 'Pomoč pri speljevanju v klanec', name_en: 'Hill start assist', icon: 'trending-up' },
    { id: 56, name_sl: 'Sistem Start-Stop', name_en: 'Start-Stop system', icon: 'power' },
  ],
  exterior: [
    { id: 57, name_sl: 'Aluminijasta platišča', name_en: 'Alloy wheels', icon: 'circle' },
    { id: 58, name_sl: 'LED žarometi', name_en: 'LED headlights', icon: 'sun' },
    { id: 59, name_sl: 'Matrix LED žarometi', name_en: 'Matrix LED headlights', icon: 'sun' },
    { id: 60, name_sl: 'Xenon žarometi', name_en: 'Xenon headlights', icon: 'sun' },
    { id: 61, name_sl: 'Pragovi v barvi karoserije', name_en: 'Color-coded sills', icon: 'square' },
    { id: 62, name_sl: 'Športno podvozje', name_en: 'Sports suspension', icon: 'settings' },
    { id: 63, name_sl: 'Zračno podvozje', name_en: 'Air suspension', icon: 'wind' },
    { id: 64, name_sl: 'Adaptivno podvozje', name_en: 'Adaptive suspension', icon: 'sliders' },
    { id: 65, name_sl: 'Roofracks', name_en: 'Roof rails', icon: 'minus' },
    { id: 66, name_sl: 'Towbar', name_en: 'Towbar', icon: 'anchor' },
    { id: 67, name_sl: 'Zasenčena stekla', name_en: 'Tinted windows', icon: 'moon' },
    { id: 68, name_sl: 'Privacy stekla', name_en: 'Privacy glass', icon: 'shield' },
    { id: 69, name_sl: 'Karbon paket', name_en: 'Carbon package', icon: 'hexagon' },
    { id: 70, name_sl: 'Športni izpuh', name_en: 'Sport exhaust', icon: 'music' },
    { id: 71, name_sl: 'Automatski žarometi', name_en: 'Auto headlights', icon: 'sun' },
    { id: 72, name_sl: 'Označevalne luči LED', name_en: 'LED DRL', icon: 'sun' },
  ],
  interior: [
    { id: 73, name_sl: 'Usnjeni sedeži', name_en: 'Leather seats', icon: 'square' },
    { id: 74, name_sl: 'Delno usnjeni sedeži', name_en: 'Partial leather seats', icon: 'square' },
    { id: 75, name_sl: 'Alcantara sedeži', name_en: 'Alcantara seats', icon: 'square' },
    { id: 76, name_sl: 'Športni sedeži', name_en: 'Sport seats', icon: 'target' },
    { id: 77, name_sl: 'Električno nastavljiv volan', name_en: 'Electric steering wheel adjustment', icon: 'zap' },
    { id: 78, name_sl: 'Volan v perforiranem usnju', name_en: 'Perforated leather steering wheel', icon: 'circle' },
    { id: 79, name_sl: 'Aluminijaste pedalne obloge', name_en: 'Aluminum pedals', icon: 'triangle' },
    { id: 80, name_sl: 'Obloga vrat - les', name_en: 'Wood trim', icon: 'square' },
    { id: 81, name_sl: 'Obloga vrat - aluminij', name_en: 'Aluminum trim', icon: 'square' },
    { id: 82, name_sl: 'Obloga vrat - karbon', name_en: 'Carbon trim', icon: 'hexagon' },
    { id: 83, name_sl: 'Sklopiva klop 60/40', name_en: 'Folding rear bench 60/40', icon: 'minimize-2' },
    { id: 84, name_sl: 'Sklopiva klop 40/20/40', name_en: 'Folding rear bench 40/20/40', icon: 'grid' },
    { id: 85, name_sl: 'Prtljažnik - tali', name_en: 'Flat boot floor', icon: 'square' },
    { id: 86, name_sl: 'Prtljažnik - delilnik', name_en: 'Boot partition', icon: 'grid' },
  ],
  seats: [
    { id: 87, name_sl: 'Sedežev: 2', name_en: 'Seats: 2', icon: 'users' },
    { id: 88, name_sl: 'Sedežev: 4', name_en: 'Seats: 4', icon: 'users' },
    { id: 89, name_sl: 'Sedežev: 5', name_en: 'Seats: 5', icon: 'users' },
    { id: 90, name_sl: 'Sedežev: 5+2', name_en: 'Seats: 5+2', icon: 'users' },
    { id: 91, name_sl: 'Sedežev: 7', name_en: 'Seats: 7', icon: 'users' },
    { id: 92, name_sl: 'Sedežev: 8', name_en: 'Seats: 8', icon: 'users' },
    { id: 93, name_sl: 'Sedeži za otroke - ISOFIX', name_en: 'Child seats - ISOFIX', icon: 'anchor' },
    { id: 94, name_sl: 'Sedeži za otroke - Top tether', name_en: 'Child seats - Top tether', icon: 'anchor' },
  ],
  doors: [
    { id: 95, name_sl: 'Vrat: 2', name_en: 'Doors: 2', icon: 'door-closed' },
    { id: 96, name_sl: 'Vrat: 3', name_en: 'Doors: 3', icon: 'door-closed' },
    { id: 97, name_sl: 'Vrat: 4', name_en: 'Doors: 4', icon: 'door-closed' },
    { id: 98, name_sl: 'Vrat: 5', name_en: 'Doors: 5', icon: 'door-closed' },
  ],
  efficiency: [
    { id: 99, name_sl: 'Start Stop sistem', name_en: 'Start Stop system', icon: 'power' },
    { id: 100, name_sl: 'Rekuperacija zavorne energije', name_en: 'Brake energy recovery', icon: 'refresh-cw' },
    { id: 101, name_sl: 'Nizke emisije', name_en: 'Low emissions', icon: 'leaf' },
    { id: 102, name_sl: 'Euro 6', name_en: 'Euro 6', icon: 'award' },
    { id: 103, name_sl: 'CO2: manj kot 100 g/km', name_en: 'CO2: less than 100 g/km', icon: 'cloud' },
    { id: 104, name_sl: 'CO2: manj kot 50 g/km', name_en: 'CO2: less than 50 g/km', icon: 'cloud' },
    { id: 105, name_sl: 'Električni doseg: nad 300 km', name_en: 'Electric range: over 300 km', icon: 'battery' },
    { id: 106, name_sl: 'Hibridni vtič', name_en: 'Plug-in hybrid', icon: 'plug' },
  ],
  other: [
    { id: 107, name_sl: 'Garažirano', name_en: 'Garaged', icon: 'home' },
    { id: 108, name_sl: 'Brezhibno', name_en: 'Impeccable condition', icon: 'award' },
    { id: 109, name_sl: 'Servisna knjiga', name_en: 'Service book', icon: 'book' },
    { id: 110, name_sl: 'Poln servis', name_en: 'Full service history', icon: 'file-text' },
    { id: 111, name_sl: 'Ne kadi', name_en: 'Non-smoker', icon: 'heart' },
    { id: 112, name_sl: 'Prvi lastnik', name_en: 'First owner', icon: 'user' },
    { id: 113, name_sl: 'Vozilo je registrirano', name_en: 'Vehicle registered', icon: 'check-circle' },
    { id: 114, name_sl: 'Vozilo je tehnično pregledano', name_en: 'Vehicle inspected', icon: 'check-circle' },
    { id: 115, name_sl: 'Možna menjava', name_en: 'Exchange possible', icon: 'repeat' },
    { id: 116, name_sl: 'Možno financiranje', name_en: 'Financing possible', icon: 'credit-card' },
    { id: 117, name_sl: 'Možna dostava', name_en: 'Delivery possible', icon: 'truck' },
    { id: 118, name_sl: 'Test vozila možen', name_en: 'Test drive possible', icon: 'play' },
  ],
}

// Helper function to get all features as flat array
export const getAllCarFeatures = () => {
  const all = []
  Object.values(carFeatures).forEach(category => {
    all.push(...category)
  })
  return all
}

// Helper function to get features by category
export const getFeaturesByCategory = (category) => {
  return carFeatures[category] || []
}

// Helper function to get feature name by id (returns SL name if language is SL, EN otherwise)
export const getFeatureNameById = (id, language = 'sl') => {
  const all = getAllCarFeatures()
  const feature = all.find(f => f.id === id)
  if (!feature) return ''
  return language === 'sl' ? feature.name_sl : feature.name_en
}

// Helper function to get feature by id
export const getFeatureById = (id) => {
  const all = getAllCarFeatures()
  return all.find(f => f.id === id)
}

// Category display names
export const featureCategoryNames = {
  safety: { sl: 'Varnost', en: 'Safety' },
  comfort: { sl: 'Udobje', en: 'Comfort' },
  technology: { sl: 'Tehnologija', en: 'Technology' },
  exterior: { sl: 'Zunanjost', en: 'Exterior' },
  interior: { sl: 'Notranjost', en: 'Interior' },
  seats: { sl: 'Sedeži', en: 'Seats' },
  doors: { sl: 'Vrata', en: 'Doors' },
  efficiency: { sl: 'Gorivo/Izplen', en: 'Fuel/Efficiency' },
  other: { sl: 'Ostalo', en: 'Other' },
}
