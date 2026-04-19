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

// Car equipment categories - with proper structure for AddCarPage
const carEquipmentData = {
  'varnost': {
    name: 'Varnost',
    icon: 'Shield',
    subcategories: {
      'zracni_blazini': {
        name: 'Zračne blazine',
        features: ['Airbag spredaj', 'Airbag nazaj', 'Airbag stransko', 'Airbag za kolena', 'Zračne zavese']
      },
      'varnostni_sistemi': {
        name: 'Varnostni sistemi',
        features: ['ABS', 'ESP', 'ASR', 'Tempomat', 'Opozorilnik razdalje', 'Senzor za mrtvi kot', 'Aktivno zaviranje']
      },
      'prislusitvena': {
        name: 'Prislusitvena',
        features: ['Alarm', 'Vsodilnik za sledenje', 'Zaklepanje volana', 'Immobilizer']
      }
    }
  },
  'udobje': {
    name: 'Udobje',
    icon: 'Settings',
    subcategories: {
      'klimatska_naprava': {
        name: 'Klimatska naprava',
        features: ['Klima', 'Avtomatska klima', 'Dvo cone klima', 'Cetiri cone klima']
      },
      'ogrevanje_hlajenje': {
        name: 'Ogrevanje in hlajenje',
        features: ['Greteks', 'Sedeži z ogrevanjem', 'Sedeži s prezračevanjem', 'Ogrevano vetrobransko steklo', 'Ogrevana ogledala']
      },
      'elektricni_pomiki': {
        name: 'Električni pomiki',
        features: ['Električni pomik sedežev', 'Električno odpiranje prtljagenika', 'Električna vrtljiva ogledala', 'Šiborna okna']
      },
      'ostalo_udobje': {
        name: 'Ostalo',
        features: ['Centralno zaklepanje', 'SMEMA', 'Tempomat', 'Pomoč pri parkiranju', 'Parkirni senzorji', 'Kamere za parkiranje', 'Električna ročna zavora']
      }
    }
  },
  'multimedija': {
    name: 'Multimedija',
    icon: 'Wifi',
    subcategories: {
      'avdio_sistemi': {
        name: 'Avdio sistemi',
        features: ['Radio', 'DAB+', 'USB', 'Bluetooth', 'Plošča za telefon']
      },
      'povezljivost': {
        name: 'Povezljivost',
        features: ['Navigacija', 'Android Auto', 'Apple CarPlay', 'Wi-Fi hotspot', 'Prikažovalnik na vetrobranu']
      },
      'ostalo_multimedija': {
        name: 'Ostalo',
        features: ['Paket za telefon', 'Prikažovalnik', 'Glasovno upravljanje', 'Dnevne LED zaslon']
      }
    }
  },
  'sedeži_in_vrata': {
    name: 'Sedeži in vrata',
    icon: 'Star',
    subcategories: {
      'sedeži': {
        name: 'Sedeži',
        features: ['Usnjeni sedeži', 'Tekturni sedeži', 'Električni sedeži', 'Vzvratni asisten', 'Masazni sedeži', 'Sedež za otroke - ISOFIX']
      },
      'notranjost': {
        name: 'Notranjost',
        features: ['Športni volan', 'Volan z ogrevanjem', 'Električno nastavljiv volan', 'Multifunkcionalen volan', 'Tapecirana notranjost']
      },
      'vrata_okna': {
        name: 'Vrata in okna',
        features: ['Panoramska streha', 'Pomična streha', 'Senčniki za okna', 'Roleta za prtljag']
      }
    }
  },
  'podvozje': {
    name: 'Podvozje',
    icon: 'Settings',
    subcategories: {
      'vzmetenje': {
        name: 'Vzmetenje',
        features: ['Športno vzmetenje', 'Zračno vzmetenje', 'Prilagodljivo vzmetenje', 'AVD']
      },
      'zavore': {
        name: 'Zavore',
        features: ['Karbonske zavore', 'Športne zavore', 'Električna ročna zavora']
      },
      'kolesa': {
        name: 'Kolesa',
        features: ['Aluminijasta platišča', 'Prestavna ročica', 'Kolesa za rezervo']
      },
      'ostalo_podvozje': {
        name: 'Ostalo',
        features: ['4x4 pogon', 'Haldex', 'Blokada diferenciala', 'Pnevmatko os', 'Tovorniško podvozje']
      }
    }
  },
  'zunanjost': {
    name: 'Zunanjost',
    icon: 'Sun',
    subcategories: {
      'svetila': {
        name: 'Svetila',
        features: ['LED žarometi', 'Xenon žarometi', 'Prilagodljivi žarometi', 'LED dnevne luči', 'Žarometi za meglo', 'Matrični LED žarometi']
      },
      'karoserija': {
        name: 'Karoserija',
        features: ['Armeriran zadnji spojler', 'Sprednji spojler', 'Podvozje za šport', 'Privlačna sidra', 'Rack za kolesa']
      },
      'ostevanje': {
        name: 'Ostevanj',
        features: ['Zaščita za prah', 'Zaščita za vremenske vplive', 'Zaščita za UV žarke', 'Zaščita za otroke']
      },
      'ostalo_zunanjost': {
        name: 'Ostalo',
        features: ['Pralnik za žaromete', 'Ogrevano vetrobransko steklo', 'Žerjav za rezervo', 'Tovorniški prostor']
      }
    }
  },
  'info_multimedia': {
    name: 'Info multimedija',
    icon: 'Wifi',
    subcategories: {
      'prikazovalniki': {
        name: 'Prikazovalniki',
        features: ['Digitalna instrumentna plošča', 'Barvni zaslon', 'Na dotik zaslon', 'Prikažovalnik na vetrobranu']
      },
      'povezljivost_infor': {
        name: 'Povezljivost',
        features: ['Navigacijski sistem', 'Android Auto', 'Apple CarPlay', 'Bluetooth', 'Wi-Fi']
      },
      'ostalo_info': {
        name: 'Ostalo',
        features: ['DAB+ radio', 'Paket za telefon', 'Prikažovalnik hitrosti', 'Glasovno upravljanje']
      }
    }
  },
  'notranjost': {
    name: 'Notranjost',
    icon: 'Car',
    subcategories: {
      'sedeži_notr': {
        name: 'Sedeži',
        features: ['Usnjeni sedeži', 'Tekturni sedeži', 'Športni sedeži', 'Električni sedeži']
      },
      'prtljazni_prostor': {
        name: 'Prtljažni prostor',
        features: ['Dvojno dno prtljaznika', 'Deljiva klop', 'Ročna vrata prtljaznika', 'Električna vrata prtljaznika']
      },
      'ostalo_notranjost': {
        name: 'Ostalo',
        features: ['Ambiente osvetlitev', 'Prilagodljiva osvetlitev', 'Električna vlečna kljuka', 'Tovorniški prostor']
      }
    }
  },
  'uporabnost': {
    name: 'Uporabnost',
    icon: 'Settings',
    subcategories: {
      'udobje_upor': {
        name: 'Udobje',
        features: ['Avdio sistem', 'Kamera za vzvratno vožnjo', 'Parkirni senzorji', 'Električni pomik']
      },
      'varnost_upor': {
        name: 'Varnost',
        features: ['Active Guard', 'Driving Assistant', 'Parking Assistant', 'Rear View Camera']
      },
      'ostalo_upor': {
        name: 'Ostalo',
        features: ['Komfort pristop', 'Keyless Go', 'Pnevmatsko vzmetenje', 'Protiblokirni sistem']
      }
    }
  },
  'garancija_stanje': {
    name: 'Garancija in stanje',
    icon: 'Award',
    subcategories: {
      'garancija': {
        name: 'Garancija',
        features: ['Brez garancije', '1 leto', '2 leti', '3 leta', '5 let', 'Podaljšana garancija']
      },
      'stanje_vozila': {
        name: 'Stanje vozila',
        features: ['Novo vozilo', 'Rabljeno vozilo', 'Vozilo z garancijo', 'Leasing vozilo']
      },
      'prevoz': {
        name: 'Prevoz',
        features: ['Možnost prevoza', 'Možnost dostave', 'Možnost zamenjave']
      }
    }
  }
}

export { carEquipmentData as carEquipmentCategories }
