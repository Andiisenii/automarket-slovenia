// Data helpers - fetches from Supabase only
// Supabase configuration
const SUPABASEURL = 'https://pajbxchnenouxeaimsdr.supabase.co'
const SUPABASEKEY = 'sbpublishableCQVFr7jAHNfQV5DXvxQiZgh7Cq6MRH'

// Cache for API data
let brandsCache = null
let lastFetchTime = 0
const CACHEDURATION = 5 * 60 * 1000 // 5 minutes

// Supabase fetch helper
const getFromSupabase = async (table, select = '*') => {
  try {
    const response = await fetch(`${SUPABASEURL}/rest/v1/${table}?select=${select}`, {
      headers: {
        'apikey': SUPABASEKEY,
        'Authorization': `Bearer ${SUPABASEKEY}`
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
  if (brandsCache && (now - lastFetchTime) < CACHEDURATION) {
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
  if (brandsCache && (now - lastFetchTime) < CACHEDURATION) {
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
      const models = await getFromSupabase('models', 'name,brandid')
      if (models && models.length > 0) {
        return models.filter(m => m.brandid === brandData.id).map(m => m.name)
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
export const fuelTypes = ['Bencin', 'Dizel', 'Hybrid', 'ElektriÄni', 'Plin (LPG)']


// Transmissions
export const transmissions = ['Avtomatski', 'RoÄni', 'Polavtomatski']


// Body types
export const bodyTypes = ['Traktor', 'Limuzina', 'Hatchback', 'Coupe', 'Kombi', 'Van', 'Pickup', 'Minivan', 'Kabriolet', 'Roadster', 'Targa', 'Fastback', 'Liftback', 'Sportni coupe', 'SUV']


// Door counts
export const doorCounts = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30+']

// Colors
export const colors = ['Bela', 'ÄŒrna', 'Siva', 'RdeÄa', 'Modra', 'Zelena', 'Rumena', 'OranÅna', 'Rjava', 'BeÅ']

// Vehicle condition options
export const vehicleConditionOptions = [
  { value: 'Vozno', label: 'Vozno', description: 'NEpoÅ¡kodovano, Ni karambolirano' },
  { value: 'NEvozno', label: 'NEvozno', description: 'poÅ¡kodovano, karambolirano' },
  { value: 'Vokvari', label: 'V okvari', description: 'vendar NI karambolirano' },
]

// Vehicle condition sub options
export const vehicleConditionSubOptions = {
  'Vozno': [
    { id: 'neposkodovano', label: 'NEpoÅ¡kodovano' },
    { id: 'nikarambolirano', label: 'Ni karambolirano' },
  ],
  'NEvozno': [
    { id: 'poskodovano', label: 'poÅ¡kodovano' },
    { id: 'karambolirano', label: 'karambolirano' },
  ],
  'Vokvari': [
    { id: 'poplavljeno', label: 'vozilo je bilo poplavijeno' },
    { id: 'dikalnik', label: 'dirkalno vozilo' },
  ],
}

// Emission classes
export const emissionClasses = ['Euro 1', 'Euro 2', 'Euro 3', 'Euro 4', 'Euro 5', 'Euro 6', 'Euro 6d', 'Euro 6e', 'Euro 6e-TEMP']

// Garancija options
export const garancijaOptions = [
  { value: 'brezgarancije', label: 'Brez garancije' },
  { value: '1leto', label: '1 leto' },
  { value: '2leti', label: '2 leti' },
  { value: '3leta', label: '3 leta' },
  { value: '4leta', label: '4 leta' },
  { value: '5let', label: '5 let ali veÄ' },
  { value: 'podogovoru', label: 'Po dogovoru' },
  { value: 'ustrezengarancijskilist', label: 'Ustrezen garancijski list' },
  { value: 'neustrezengarancijskilist', label: 'Neustrezen garancijski list' },
]

// Registration options
export const registracijaOptions = [
  { value: 'veljavnaregistracija', label: 'Veljavna registracija' },
  { value: 'poteklaregistracija', label: 'Potekla registracija' },
]


// Vehicle age options
export const vehicleAgeOptions = [
  { value: '0-0', label: 'Novo vozilo' },
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
export const FALLBACKBRANDS = []
export const FALLBACKMODELS = {}


// Luxury car threshold and fee
export const LUXURYCARTHRESHOLD = 50000
export const LUXURYFEE = 5

// Slavenian cities
export const slovenianCities = [
  'Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Koper', 'Nova Gorica',
  'KrÅ¡ko', 'Novo Mesto', 'Ptuj', 'Trbovlje', 'Kamnik', 'Jesenice', 'Å1⁄2alec',
  'Å1⁄2irovnica', 'Bled', 'Bohinj', 'BreÅice', 'Cerklje ob Krki', 'Cerknica',
  'Cerkno', 'Crnomelj', 'Dravograd', 'Gornja Radgona', 'Grosuplje', 'Hrastnik',
  'Idrija', 'Ilirska Bistrica', 'Izola', 'Jurovski Dol', 'Kanal ob SoÄi',
  'KoÄevje', 'Komen', 'Kozina', 'Kranjska Gora', 'Lendava', 'Litija', 'Logatec',
  'Metlika', 'MeÅica', 'Murska Sobota', 'Muta', 'Nazaret', 'OrmoÅ', 'Piran',
  'Postojna', 'Prevalje', 'RadeÄe', 'Radlje ob Dravi', 'Radovljica', 'Ravne na KoroÅ¡kem',
  'Ribnica', 'RogaÅ¡ka Slatina', 'Rogatec', 'RuÅ¡e', 'SeÅana', 'Slovenska Bistrica',
  'Slovenske Konjice', 'Å entjur', 'Å kofja Loka', 'Å marje pri JelÅ¡ah', 'Tolmin',
  'Trebnje', 'TrÅiÄ', 'TurniÅ¡Äe', 'Velenje', 'Vinica', 'Vipava', 'Vitanje',
  'Vodice', 'VoÅec', 'Zagorje ob Savi', 'ZavrÄ', 'ZreÄe', 'Å1⁄2elezniki'
]

// Vehicle type categories
export const vehicleCategories = [
  { value: 'avto', label: 'Avto', icon: 'Car' },
  { value: 'moto', label: 'Motor', icon: 'Bike' },
  { value: 'kamion', label: 'Kamion', icon: 'Truck' },
  { value: 'kombi', label: 'Kombi', icon: 'Van' },
  { value: 'traktor', label: 'Traktor', icon: 'Tractor' },
  { value: 'avtodom', label: 'AvtoDom', icon: 'Home' },
]

// Vehicle subcategories based on type
export const vehicleSubCategories = {
  'avto': {
    label: 'Podkategorija',
    options: [
      'Limuzina',
      'Karavan',
      'SUV',
      'Coupe',
      'Kabriolet',
      'Hatchback',
      'Pickup',
      'Minivan',
      'Van',
      'Kombi',
    ]
  },
  'moto': {
    label: 'Izberite podrubriko',
    options: [
      'Motorno kolo',
      'Skuter, Maxi-scooter, 3-4 kolesni scooter',
      'Moped, kolo z motorjem',
      '4-kolesnik, ATV, UTV, 3-kolesnik',
      'Minimoto',
      'Oldtimer',
      'Go-kart',
      'Motorne sani',
      'E-skiro',
      'E-kolo',
      'E-moto',
    ]
  },
  'kamion': {
    label: 'Izberite podrubriko',
    options: [
      'Dostavna vozila',
      'Tovorna vozila',
      'Avtobusi',
      'Tovorneprikolice',
      'KamUTV',
    ]
  },
  'kombi': {
    label: 'Izberite podrubriko',
    options: [
      'Dostavna vozila',
      'Tovorna vozila',
      'Avtobusi',
      'Tovorneprikolice',
      'KamUTV',
    ]
  },
  'traktor': {
    label: 'Izberite podrubriko',
    options: [
      'Gradbena mehanizacija',
      'Kmetijska mehanizacija',
      'ViliÄarji',
      'Gozdarska mehanizacija',
      'Komunalna mehanizacija',
    ]
  },
  'avtodom': {
    label: 'Izberite podrubriko',
    options: [
      'Avtodom',
      'PoÄitniÅ¡ka prikolica',
      'Mobilna hiÅ¡ica',
      'Snemljivi bivalnik',
      'Å otorska prikolica',
      'Navtika',
      'E-kolo',
      'E-skiro',
    ]
  },
}

// Subcategory mapping: main subcategory key -> detailed options
// Used when user selects a subcategory like "Dostavna vozila" and needs more specific options
export const subCategoryDetails = {
  // For Kombi and Kamion - Dostavna vozila subcategory
  'Dostavna vozila': {
    label: 'Vrsta dostavnega vozila',
    options: [
      'Furgon',
      'Kombi',
      'Kamionet',
      'Å asija s kabino',
      'Å asija z nadgradnjo',
      'Pick up',
    ]
  },
  // For Kombi and Kamion - Tovorna vozila subcategory
  'Tovorna vozila': {
    label: 'Vrsta tovornega vozila',
    options: [
      'Avtovleka',
      'Avtotransporter',
      'Furgon',
      'Gasilsko vozilo',
      'Gozdarsko vozilo',
      'Komunalno vozilo',
      'Kontejnerski tovornjak',
      'Kiper',
      'MeÅ¡alnik betona',
      'S cisterno',
      'S hladilnikom',
      'S kesonom',
      'S platojem',
      'S ponjavo',
      'S prekucnikom',
      'Smetarsko vozilo',
      'Storitveni',
      'Tovornjak-Å¡asija',
      'VlaÄilec',
      'Z dviÅno ploÅ¡Äadjo',
      'Z mobilnim vrtalnikom',
      'Z Åerjavom',
      'Za hlode',
      'Za prevoz Åivine',
      'Za razsuti tovor',
      'Zabojnik',
    ]
  },
  // For Kombi and Kamion - Avtobusi subcategory
  'Avtobusi': {
    label: 'Vrsta avtobusa',
    options: [] // No detailed subcategory - just show label
  },
  // For Kombi and Kamion - UTV vozila subcategory
  'KamUTV': {
    label: 'Vrsta UTV vozila',
    options: [] // No detailed subcategory
  },
  // Traktor - Gradbena mehanizacija
  'Gradbena mehanizacija': {
    label: 'Vrsta gradbene mehanizacije',
    options: [
      'ni pomembno',
      'bager / goseniÄar',
      'bager / na kolesih',
      'buldoÅer',
      'demper',
      'drobilec',
      'dvigalo',
      'dviÅna ploÅ¡Äad',
      'freza',
      'greder',
      'kladivo',
      'kombinirka / rovokopaÄ',
      'kompresor / agregat',
      'mehanizacija za kamnolom',
      'mini bager',
      'nakladalec',
      'robot',
      'valjar',
      'ostala mehanizacija',
    ]
  },
  // Traktor - Kmetijska mehanizacija
  'Kmetijska mehanizacija': {
    label: 'Vrsta kmetijske mehanizacije',
    options: [
      'ni pomembno',
      'balirka',
      'brana',
      'cisterna za prevoz',
      'Äesalnik',
      'dognojevalec',
      'freza',
      'izkopalnik / okopalnik',
      'kmetijski kombajn',
      'kosilnica',
      'meÅ¡alnica krmil',
      'motokultivator',
      'mulÄar',
      'nakladalec',
      'obraÄalnik',
      'odjemalec silaÅe',
      'ovijalka za bale',
      'plug',
      'predsetvenik',
      'sadilna tehnika',
      'samonakladalka',
      'sejalnica',
      'Å¡kropilnica',
      'Å¡rotar',
      'traktor',
      'traktorska prikolica',
      'traktorski plato',
      'trosilec',
      'zgrabljalnik',
      'vrtni traktor',
      'ostala mehanizacija',
    ]
  },
  // Traktor - ViliÄarji
  'ViliÄarji': {
    label: 'Vrsta viliÄarja',
    options: [
      'ni pomembno',
      'Äelni',
      'paletni',
      'boÄni',
      'regalni',
      'roÄni',
      'teleskopski',
      'komisionirni',
    ]
  },
  'Avtodom': {
    label: 'Vrsta avtodoma',
    options: [
      'Alkoven',
      'Polintegriran',
      'Integriran',
      'Crossover',
      'Kombi / Van',
      'ni pomembno',
    ]
  },
  'PoÄitniÅ¡ka prikolica': {
    label: 'Vrsta poÄitniÅ¡ke prikolice',
    options: [] // No subcategories
  },
  'Mobilna hiÅ¡ica': {
    label: 'Vrsta mobilne hiÅ¡ice',
    options: [] // No subcategories
  },
  'Snemljivi bivalnik': {
    label: 'Vrsta snemljivega bivalnika',
    options: [] // No subcategories
  },
  'Å otorska prikolica': {
    label: 'Vrsta Å¡otorske prikolice',
    options: [] // No subcategories
  },
  // For Kombi and Kamion - Tovorne prikolice subcategory
  'Tovorneprikolice': {
    label: 'Vrsta tovorne prikolice',
    options: [
      'ni pomembno',
      'Betonski meÅ¡alnik',
      'Cisterna',
      'Delovni oder',
      'Hladilnik',
      'Keson',
      'Keson + ponjava',
      'Kontejnerska prikolica',
      'Nizki priklopnik',
      'Platforma',
      'Podvozje',
      'Prekucnik',
      'Prodajna prikolica',
      'Silos',
      'Tandemska prikolica',
      'Traktorska prikolica',
      'Transporter dolgega materiala',
      'Walking floor',
      'za transport stekla',
      'za Äolne',
      'za konje',
      'za prevoz lesa',
      'za prevoz pijaÄ',
      'za prevoz vozil',
      'za prevoz Åivine',
      'Ostale prikolice',
    ]
  },
  // For Kombi and Kamion - UTV vozila subcategory
  'KamUTV': {
    label: 'Vrsta UTV vozila',
    options: [
      'ATV',
      'KamUTV',
      '3-kolesnik',
    ]
  },
  'traktor': {
    label: 'Izberite podrubriko',
    options: [
      'Gradbena mehanizacija',
      'Kmetijska mehanizacija',
      'ViliÄarji',
      'Gozdarska mehanizacija',
      'Komunalna mehanizacija',
    ]
  },
  'avtodom': {
    label: 'Izberite podrubriko',
    options: [
      'Avtodom',
      'PoÄitniÅ¡ka prikolica',
      'Mobilna hiÅ¡ica',
      'Snemljivi bivalnik',
      'Å otorska prikolica',
      'Navtika',
      'E-kolo',
      'E-skiro',
    ]
  },
}

// Brands and default models - empty, data from Supabase
export const brands = []
export const defaultModels = {}


// ============================================================
// CAR EQUIPMENT CATEGORIES - one per vehicle type
// ============================================================

// Equipment for AVTO (standard cars)
const avtoEquipmentCategories = {
  'notranjost': {
    name: 'Notranjost',
    icon: 'Car',
    subcategories: {
      'udobje': {
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
          'SedeÅi: nastavitev po visini',
          'SedeÅi: el. nastavitev',
          'SedeÅi: paket Memory',
          'SedeÅi: gretje spreda',
          'SedeÅi: gretje zadaj',
          'SedeÅi: hlajenje / ventilacija',
          'SedeÅi: masazna funkcija',
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
          'Ogrevano vetrobransko steklo'
        ]
      }
    }
  },
  'infomultimedia': {
    name: 'Info-Multimedia',
    icon: 'Wifi',
    subcategories: {
      'avdioinpovezovanje': {
        name: 'Avtoradio in povezovanje',
        features: [
          'Avtoradio',
          'Avtoradio / CD',
          'Hi-Fi ozvocenje',
          'CD izmenjevalnik / streÅnik',
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
          'Touch screen'
        ]
      }
    }
  },
  'uporabnost': {
    name: 'Uporabnost',
    icon: 'Settings',
    subcategories: {
      'uporabnostvse': {
        name: 'Uporabnost',
        features: [
          'Deljiva zad.klop 1/2 - 1/2',
          'Deljiva zad.klop 1/3 - 2/3',
          'Deljiva zad.klop 1/3-1/3-1/3',
          'Isofix sistem za pritrditev sedeza',
          'Integrirani otroÅ¡ki sedez',
          'Vreca za smuci',
          'Mrezasta pregrada tovornega prostora',
          'Rolo prijaznega prostora',
          'Navodila za uporabo v SLO jeziku',
          'Dvojno dno prtljaznika',
          'StreÅ¡ne sani',
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
          'Vozilo priagojeno invalidu'
        ]
      }
    }
  },
  'sedeÅiinvrata': {
    name: 'SedeÅi in vrata',
    icon: 'Star',
    subcategories: {
      'sedeÅi': {
        name: 'SedeÅi',
        features: [
          'SedeÅev: 2',
          'SedeÅev: 4',
          'SedeÅev: 5',
          'SedeÅev: 5+2',
          'SedeÅev: 7',
          'SedeÅev: 8',
          'Bus 30+',
          'Usnjeni sedeÅi',
          'Delno usnjeni sedeÅi',
          'Alcantara sedeÅi',
          'Sklopiva klop 60/40',
          'Sklopiva klop 40/20/40'
        ]
      },
      'oblogevrat': {
        name: 'Obloge vrat',
        features: [
          'Obloga vrat - les',
          'Obloga vrat - aluminij',
          'Obloga vrat - karbon',
          'Obloga vrat - krom'
        ]
      },
      'Å¡tevilovrat': {
        name: 'Å tevilo vrat',
        features: [
          'Vrat: 2',
          'Vrat: 3',
          'Vrat: 4',
          'Vrat: 5'
        ]
      }
    }
  },
  'podvozje': {
    name: 'Podvozje',
    icon: 'Settings',
    subcategories: {
      'platiÅ¡Äa': {
        name: 'PlatiÅ¡Äa',
        features: ['Platisca (ALU)']
      },
      'zavornisistem': {
        name: 'Zavorni sistem',
        features: [
          'Zavorni sistem (ABS)',
          'Pomoc pri zaviranju (BAS / DBC / EBV)',
          'Samodejna zapora diferenciala (ASD / EDS)'
        ]
      },
      'stabilnost': {
        name: 'Stabilnost',
        features: [
          'Elektronski program stabilnosti (ESP / DSC)',
          'Elektronski nadzor Blaiseilnikov (EDC)',
          'Regulacija nivoja podvozja (ADS)',
          'Stirikolesni volan (4WS / 4CONTROL)',
          'Regulacija zdrsa pogonskih koles (ASR / DTC)',
          'Elektronski sistem za bolisi opnijem koles ETS'
        ]
      },
      'vrstapodvozja': {
        name: 'Vrsta podvozja',
        features: [
          'Å portno podvozje',
          'Aktivno vzmetenje (ABC - Active Body Control)',
          'Zracno vzmetenje',
          'Å tirikolesni pogon (4x4 / 4WD / Quattro)'
        ]
      }
    }
  },
  'varnost': {
    name: 'Varnost',
    icon: 'Shield',
    subcategories: {
      'Å¡teviloairbagov': {
        name: 'Å tevilo airbagov',
        features: [
          'Airbag - voznik',
          'Airbag - sopotnik',
          'Airbag - stranski (vratni)',
          'Airbag - zavesni',
          'Airbag - kolenski'
        ]
      },
      'Åarometiinluci': {
        name: 'Å1⁄2arometi in luÄi',
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
          'Naprava za pranie zarometov'
        ]
      },
      'varnostniasistenti': {
        name: 'Varnostni asistenti',
        features: [
          'Head-Up display',
          'Sistem za ohranjanje voznega pasu',
          'Sistem za opozarjanje na mrtvi kot',
          'Sistem za prepoznavo prometnih znakov',
          'Senzor za dez',
          'Sistem za samodejno zaviranje v sili',
          'Opozorilnik spremembe voznega pasu',
          'Opozorilnik varnostne razdalje'
        ]
      },
      'zaÅ¡Äita': {
        name: 'ZaÅ¡Äita',
        features: [
          'Alarmna naprava',
          'Blokada motorja',
          'Kodno varovan vzign motorja'
        ]
      },
      'pnevmatike': {
        name: 'Pnevmatike',
        features: [
          'Rezervno kolo normalne dimenzije',
          'Run-Flat pnevmatike'
        ]
      }
    }
  },
  'zunanjost': {
    name: 'Zunanjost',
    icon: 'Sun',
    subcategories: {
      'zunanjostvse': {
        name: 'Zunanjost',
        features: [
          'Roofracks - StreÅ¡ne sani',
          'Towbar - Vlecna kljuka',
          'ZasenÄena stekla',
          'Privacy stekla',
          'Karbon paket zunanj',
          'Å portni izpuh',
          'Automatski Åarometi',
          'OznaÄevalne luci LED'
        ]
      }
    }
  },
  'garancijastanje': {
    name: 'Garancija in stanje',
    icon: 'Award',
    subcategories: {
      'garancija': {
        name: 'Garancija',
        features: [
          'Vozilo ima garancio',
          'Vozilo ima jamstvo',
          'Vozilo ima oldtimer certifikat',
          'Servisna knjiga',
          'Poln servis',
          'GaraÅirano',
          'Brezhibno',
          'Ne kadi',
          'Prvi lastnik'
        ]
      },
      'registracija': {
        name: 'Registracija',
        features: [
          'Vozilo je registrirano',
          'Vozilo je tecnicno pregledano'
        ]
      }
    }
  }
}

// Equipment for MOTOR (motorcycles)
const motorEquipmentCategories = {
  'motoroprema': {
    name: 'Oprema',
    icon: 'Settings',
    subcategories: {
      'motoropremavse': {
        name: 'Oprema',
        features: [
          'Å portni izpuh',
          'ABS zavorni sistem',
          'Protizdrsni sistem (TCS)',
          'Nadzor tlaka v pnevmatikah (RDC)',
          'Elektronsko nastavljivo vzmetenje (ESA)',
          'Vzvratna prestava',
          'Tempomat',
          'Varnostni zaÅ¡Äitni loki',
          'Katalizator',
          '12V vtiÄnica',
          'Alarmna naprava',
          'Kodno varovan vÅig motorja',
          'Radio',
          'Nastavljiv sedeÅ po viÅ¡ini',
          'Gretje sedeÅa',
          'Gretje roÄic krmila',
          'Stabilizator krmila',
          'PrtljaÅni kovÄek',
          'Stranski kovÄek',
          'Vetrna zaÅ¡Äita',
          'Navigacija',
          'Airbag',
          'Meglenke',
          'Potovalni raÄunalnik',
          'Custom predelava',
        ]
      }
    }
  }
}

// Default auto-selected features (standard on most cars)
export const DEFAULTAUTOSELECTFEATURES = [
  // Varnost - basic safety that comes with every car
  'Zavorni sistem (ABS)',
  'Elektronski program stabilnosti (ESP / DSC)',
  'Airbag - voznik',
  'Airbag - sopotnik',
  // Notranjost - common features
  'Centralno zaklepanje',
  'Centralno zaklepanje z daljinskim',
  'Elektricni pomik prednjih stekel',
  'Servo volan',
  'Tempomat',
  // Podvozje
  'Regulacija zdrsa pogonskih koles (ASR / DTC)',
]

// carEquipmentCategories = avtoEquipmentCategories (backwards compat)
const carEquipmentCategories = avtoEquipmentCategories
export { carEquipmentCategories }

// Equipment for KAMION - AVTOBUSI subcategory
const kamionAvtobusEquipmentCategories = {
  'podvozjea': {
    name: 'Podvozje',
    icon: 'Settings',
    subcategories: {
      'podvozjeav': {
        name: 'Podvozje',
        features: [
          'Zavorni sistem (ABS)',
          'PomoÄ pri zaviranju BAS',
          'Elektronski program stabilnosti (ESP)',
        ]
      }
    }
  },
  'varnosta': {
    name: 'Varnost',
    icon: 'Shield',
    subcategories: {
      'varnostav': {
        name: 'Varnost',
        features: [
          'Å tevilo airbagov',
          'Nadzor zraÄnega tlaka v pnevmatikah (RDK)',
          'Senzor za deÅ',
          'Xenonski Åarometi',
          'Meglenke',
          'Naprava za pranje Åarometov',
          'Alarmna naprava',
        ]
      }
    }
  },
  'notranjosta': {
    name: 'Notranjost',
    icon: 'Car',
    subcategories: {
      'notranjostav': {
        name: 'Notranjost',
        features: [
          'Kuhinja',
          'Hladilnik',
          'WC',
          'SedeÅi: komfortni',
          'SedeÅi: ortopedski',
          'SedeÅi: nastavitev po viÅ¡ini',
          'SedeÅi: el. nastavitev',
          'SedeÅi: paket Memory',
          'SedeÅi: gretje',
          'SedeÅi: hlajenje / ventilacija',
          'Sredinski naslon za roko med sedeÅi',
          'ZloÅljiv sovoznikov sedeÅ',
          'Sovoznik: sedeÅ za 2 osebi',
          'Servisna knjiga potrjena',
          'GaraÅirano',
          'NepoÅ¡kodovano',
          'Nekarambolirano',
          'Slovensko poreklo',
        ]
      }
    }
  },
  'udobjea': {
    name: 'Udobje',
    icon: 'Settings',
    subcategories: {
      'udobjeav': {
        name: 'Udobje',
        features: [
          'Klimatska naprava - roÄna',
          'Avtomatska klimatska naprava / digitalna',
          'Klimatska naprava - 2 conska',
          'Webasto',
          'Tonirana stekla',
          'ElektriÄni pomik prednjih stekel',
          'El. nastavljiva zunanja ogledala',
          'Ogrevanje zunanjih ogledal',
          'Centralno zaklepanje',
          'ElektriÄni paket',
          'Nastavljiv volan po viÅ¡ini',
          'Nastavljiv volan po globini',
          'Servo volan',
          'Volanski obroÄ obleÄen v usnje',
          'Multifunkcijski volan',
          'Tempomat',
        ]
      }
    }
  },
  'infoa': {
    name: 'Info-Multimedia',
    icon: 'Wifi',
    subcategories: {
      'infoav': {
        name: 'Info-Multimedia',
        features: [
          'Avtoradio',
          'Avtoradio / CD',
          'DVD predvajalnik',
          'TV sprejemnik / tuner',
          'Predpriprava za mobilni telefon',
          'Avtotelefon',
          'Potovalni raÄunalnik',
          'Komunikacijski paket',
          'Navigacija',
          'Navigacija + TV',
        ]
      }
    }
  },
}

// UTV equipment - same as motorcycle
const kamionKamUTVEquipmentCategories = {
  'utvoprema': {
    name: 'Oprema',
    icon: 'Settings',
    subcategories: {
      'utvopremavse': {
        name: 'Oprema',
        features: [
          'Å portni izpuh',
          'ABS zavorni sistem',
          'Protizdrsni sistem (TCS)',
          'Nadzor tlaka v pnevmatikah (RDC)',
          'Elektronsko nastavljivo vzmetenje (ESA)',
          'Vzvratna prestava',
          'Tempomat',
          'Varnostni zaÅ¡Äitni loki',
          'Katalizator',
          '12V vtiÄnica',
          'Alarmna naprava',
          'Kodno varovan vÅig motorja',
          'Radio',
          'Nastavljiv sedeÅ po viÅ¡ini',
          'Gretje sedeÅa',
          'Gretje roÄic krmila',
          'Stabilizator krmila',
          'PrtljaÅni kovÄek',
          'Stranski kovÄek',
          'Vetrna zaÅ¡Äita',
          'Navigacija',
          'Airbag',
          'Meglenke',
          'Potovalni raÄunalnik',
          'Custom predelava',
        ]
      }
    }
  }
}

// Tovorna prikolica - no equipment list, only form fields (dolÅina, Å¡irina, osi, nosilnost, etc.)

// Equipment for KAMION (trucks / delivery vehicles) - ALL items from user list
const kamionEquipmentCategories = {
  'podvozjek': {
    name: 'Podvozje',
    icon: 'Settings',
    subcategories: {
      'podvozjekv': {
        name: 'Podvozje',
        features: [
          'Podvozje: lahka (ALU) platiÅ¡Äa',
          'Zavorni sistem (ABS)',
          'PomoÄ pri zaviranju BAS',
          'Elektronski program stabilnosti (ESP)',
          'Regulacija nivoja podvozja (ADS)',
          'ZraÄno vzmetenje',
          'Nadzor zibanja prikolice TSC',
          'Prilagodljiv naÄin obremenitve LAC',
          'Å tirikolesni pogon (4x4 / 4WD)',
          'PodaljÅ¡ana medosna razdalja',
          'OjaÄano vzmetenje',
          'Aktivno vzmetenje (ABC)',
          'Sistem proti prevraÄanju RSC',
        ]
      }
    }
  },
  'varnostk': {
    name: 'Varnost',
    icon: 'Shield',
    subcategories: {
      'varnostkv': {
        name: 'Varnost',
        features: [
          'Å tevilo airbagov',
          'Nadzor zraÄnega tlaka v pnevmatikah (RDK)',
          'Xenonski Åarometi',
          'Bi-xenonski Åarometi',
          'LED Åarometi',
          'Prednje (dnevne) LED luÄi',
          'Zadnje LED luÄi',
          'Meglenke',
          'Adaptive light / dinamiÄno prilagodljivi Åarometi',
          'Sistem za prepoznavo prometnih znakov',
          '3. zavorna luÄ',
          'Naprava za pranje Åarometov',
          'Alarmna naprava',
          'Blokada motorja',
          'Kodno varovan vÅig motorja',
          'Sistem za opozarjanje na mrtvi kot',
          'Senzor za deÅ',
          'Sistem za samodejno zaviranje v sili',
          'Opozorilnik spremembe voznega pasu',
        ]
      }
    }
  },
  'notranjostk': {
    name: 'Notranjost',
    icon: 'Car',
    subcategories: {
      'notranjostkv': {
        name: 'Notranjost',
        features: [
          'Paket za kadilce',
          'SedeÅi: komfortni',
          'SedeÅi: ortopedski',
          'SedeÅi: nastavitev po viÅ¡ini',
          'SedeÅi: el. nastavitev',
          'SedeÅi: paket Memory',
          'SedeÅi: gretje',
          'SedeÅi: hlajenje / ventilacija',
          'Hladilni predal',
          'Sredinski naslon za roko med sedeÅi',
          'ZloÅljiv sovoznikov sedeÅ',
          'Sovoznik: sedeÅ za 2 osebi',
          'Vzglavniki na vseh sedeÅih',
          'Pregradna stena',
          'Polica pod stropom kabine',
          'Osvetlitev tovornega prostora',
          'Zastekljen tovorni prostor',
          '12V vtiÄnica',
          'Spalna kabina',
          'Servisna knjiga potrjena',
          'GaraÅirano',
          'NepoÅ¡kodovano',
          'Nekarambolirano',
          'Slovensko poreklo',
        ]
      }
    }
  },
  'udobjek': {
    name: 'Udobje',
    icon: 'Settings',
    subcategories: {
      'udobjekv': {
        name: 'Udobje',
        features: [
          'Klimatska naprava - roÄna',
          'Avtomatska klimatska naprava / digitalna',
          'Klimatska naprava - 2 conska',
          'Dodatno gretje',
          'Webasto',
          'Tonirana stekla',
          'ElektriÄni pomik prednjih stekel',
          'El. nastavljiva zunanja ogledala',
          'Ogrevanje zunanjih ogledal',
          'El. zloÅljiva zunanja ogledala',
          'Keyless Go',
          'Centralno zaklepanje',
          'Centralno zaklepanje z dalj. upravljanjem',
          'ElektriÄni paket',
          'Nastavljiv volan po viÅ¡ini',
          'Nastavljiv volan po globini',
          'Servo volan',
          'Volanski obroÄ obleÄen v usnje',
          'Multifunkcijski volan',
          'Tempomat',
          'Aktivni tempomat (Adaptive Cruise Control)',
          'El. parkirna zavora',
        ]
      }
    }
  },
  'infomultimediak': {
    name: 'Info-Multimedia',
    icon: 'Wifi',
    subcategories: {
      'infokv': {
        name: 'Info-Multimedia',
        features: [
          'Avtoradio',
          'Avtoradio / CD',
          'CD izmenjevalnik / streÅnik',
          'MP3 predvajalnik',
          'DVD predvajalnik',
          'Trdi disk za shranjevanje podatkov',
          'USB prikljuÄek (iPod, HD, ...)',
          'TV sprejemnik / tuner',
          'Digitalni radio DAB',
          'Predpriprava za mobilni telefon',
          'Avtotelefon',
          'Potovalni raÄunalnik',
          'Komunikacijski paket',
          'Navigacija',
          'Navigacija + TV',
        ]
      }
    }
  },
  'uporabnostk': {
    name: 'Uporabnost',
    icon: 'Settings',
    subcategories: {
      'uporabnostkv': {
        name: 'Uporabnost',
        features: [
          'PoviÅ¡ana streha kabine',
          'DviÅni rob strehe',
          'MreÅnasta pregrada tovornega prostora',
          'StreÅ¡ne sani',
          'VleÄna kljuka',
          'PomoÄ pri speljevanju v klanec',
          'Sistem za aktivno pomoÄ pri parkiranju',
          'Parkirni senzorji PDC',
          'PomoÄ pri parkiranju: kamera',
          'PomoÄ pri parkiranju: prednji senzorji',
          'PomoÄ pri parkiranju: zadnji senzorji',
          'PomoÄ pri parkiranju: pogled 360 stopinj',
          'Vzvratna kamera',
          'Vozilo prilagojeno invalidu',
        ]
      }
    }
  },
}

// Map subcategory â†' equipment (for Kamion)
export const kamionSubCategoryEquipmentMap = {
  'Avtobusi': kamionAvtobusEquipmentCategories,
  'KamUTV': kamionKamUTVEquipmentCategories,
  'Tovorneprikolice': {}, // no equipment, only form fields
}

// Map vehicle category â†' its equipment categories object
export const vehicleEquipmentMap = {
  'avto': avtoEquipmentCategories,
  'moto': motorEquipmentCategories,
  'kamion': kamionEquipmentCategories,
}

// Default features per vehicle category (used when switching category)
export const DEFAULTFEATURESPERCATEGORY = {
  'avto': [
    'Zavorni sistem (ABS)',
    'Elektronski program stabilnosti (ESP / DSC)',
    'Airbag - voznik',
    'Airbag - sopotnik',
    'Centralno zaklepanje',
    'Centralno zaklepanje z daljinskim',
    'Elektricni pomik prednjih stekel',
    'Servo volan',
    'Tempomat',
    'Regulacija zdrsa pogonskih koles (ASR / DTC)',
  ],
  'moto': [
    'ABS zavorni sistem',
    'Tempomat',
    'Radio',
  ],
  'kamion': [
    'Zavorni sistem (ABS)',
    'Elektronski program stabilnosti (ESP / DSC)',
    'Tempomat',
    'Centralno zaklepanje',
  ],
}
