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
      'Tovorne prikolice',
      'UTV vozila',
    ]
  },
  'kombi': {
    label: 'Izberite podrubriko',
    options: [
      'Dostavna vozila',
      'Tovorna vozila',
      'Avtobusi',
      'Tovorne prikolice',
      'UTV vozila',
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
      'Šasija s kabino',
      'Šasija z nadgradnjo',
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
      'Mešalnik betona',
      'S cisterno',
      'S hladilnikom',
      'S kesonom',
      'S platojem',
      'S ponjavo',
      'S prekucnikom',
      'Smetarsko vozilo',
      'Storitveni',
      'Tovornjak-šasija',
      'Vlačilec',
      'Z dvižno ploščadjo',
      'Z mobilnim vrtalnikom',
      'Z žerjavom',
      'Za hlode',
      'Za prevoz živine',
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
  'UTV vozila': {
    label: 'Vrsta UTV vozila',
    options: [] // No detailed subcategory
  },
  // Traktor - Gradbena mehanizacija
  'Gradbena mehanizacija': {
    label: 'Vrsta gradbene mehanizacije',
    options: [
      'ni pomembno',
      'bager / goseničar',
      'bager / na kolesih',
      'buldožer',
      'demper',
      'drobilec',
      'dvigalo',
      'dvižna ploščad',
      'freza',
      'greder',
      'kladivo',
      'kombinirka / rovokopač',
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
      'česalnik',
      'dognojevalec',
      'freza',
      'izkopalnik / okopalnik',
      'kmetijski kombajn',
      'kosilnica',
      'mešalnica krmil',
      'motokultivator',
      'mulčar',
      'nakladalec',
      'obračalnik',
      'odjemalec silaže',
      'ovijalka za bale',
      'plug',
      'predsetvenik',
      'sadilna tehnika',
      'samonakladalka',
      'sejalnica',
      'škropilnica',
      'šrotar',
      'traktor',
      'traktorska prikolica',
      'traktorski plato',
      'trosilec',
      'zgrabljalnik',
      'vrtni traktor',
      'ostala mehanizacija',
    ]
  },
  // Traktor - Viličarji
  'Viličarji': {
    label: 'Vrsta viličarja',
    options: [
      'ni pomembno',
      'čelni',
      'paletni',
      'bočni',
      'regalni',
      'ročni',
      'teleskopski',
      'komisionirni',
    ]
  },
  // Traktor - Gozdarska mehanizacija
  'Gozdarska mehanizacija': {
    label: 'Vrsta gozdarske mehanizacije',
    options: [] // No detailed subcategory yet
  },
  // Traktor - Komunalna mehanizacija
  'Komunalna mehanizacija': {
    label: 'Vrsta komunalne mehanizacije',
    options: [] // No detailed subcategory yet
  },
  // For Kombi and Kamion - Tovorne prikolice subcategory
  'Tovorne prikolice': {
    label: 'Vrsta tovorne prikolice',
    options: [
      'ni pomembno',
      'Betonski mešalnik',
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
      'za čolne',
      'za konje',
      'za prevoz lesa',
      'za prevoz pijač',
      'za prevoz vozil',
      'za prevoz živine',
      'Ostale prikolice',
    ]
  },
  // For Kombi and Kamion - UTV vozila subcategory
  'UTV vozila': {
    label: 'Vrsta UTV vozila',
    options: [
      'ATV',
      'UTV',
      '3-kolesnik',
    ]
  },
  'traktor': {
    label: 'Izberite podrubriko',
    options: [
      'Gradbena mehanizacija',
      'Kmetijska mehanizacija',
      'Viličarji',
      'Gozdarska mehanizacija',
      'Komunalna mehanizacija',
    ]
  },
  'avtodom': {
    label: 'Izberite podrubriko',
    options: [
      'Avtodom',
      'Počitniška prikolica',
      'Mobilna hišica',
      'Snemljivi bivalnik',
      'Šotorska prikolica',
      'Navtika',
      'E-kolo',
      'E-skiro',
    ]
  },
}

// Brands and default models - empty, data from Supabase
export const brands = []
export const defaultModels = {}


// Car equipment categories - with proper structure for AddCarPage
const carEquipmentCategories = {
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
          'Ogrevano vetrobransko steklo'
        ]
      }
    }
  },
  'info_multimedia': {
    name: 'Info-Multimedia',
    icon: 'Wifi',
    subcategories: {
      'avdio_in_povezovanje': {
        name: 'Avtoradio in povezovanje',
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
          'Touch screen'
        ]
      }
    }
  },
  'uporabnost': {
    name: 'Uporabnost',
    icon: 'Settings',
    subcategories: {
      'uporabnost_vse': {
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
          'Vozilo priagojeno invalidu'
        ]
      }
    }
  },
  'sedeži_in_vrata': {
    name: 'Sedeži in vrata',
    icon: 'Star',
    subcategories: {
      'sedeži': {
        name: 'Sedeži',
        features: [
          'Sedežev: 2',
          'Sedežev: 4',
          'Sedežev: 5',
          'Sedežev: 5+2',
          'Sedežev: 7',
          'Sedežev: 8',
          'Bus 30+',
          'Usnjeni sedeži',
          'Delno usnjeni sedeži',
          'Alcantara sedeži',
          'Sklopiva klop 60/40',
          'Sklopiva klop 40/20/40'
        ]
      },
      'obloge_vrat': {
        name: 'Obloge vrat',
        features: [
          'Obloga vrat - les',
          'Obloga vrat - aluminij',
          'Obloga vrat - karbon',
          'Obloga vrat - krom'
        ]
      },
      'število_vrat': {
        name: 'Število vrat',
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
      'platišča': {
        name: 'Platišča',
        features: ['Platisca (ALU)']
      },
      'zavorni_sistem': {
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
      'vrsta_podvozja': {
        name: 'Vrsta podvozja',
        features: [
          'Športno podvozje',
          'Aktivno vzmetenje (ABC - Active Body Control)',
          'Zracno vzmetenje',
          'Štirikolesni pogon (4x4 / 4WD / Quattro)'
        ]
      }
    }
  },
  'varnost': {
    name: 'Varnost',
    icon: 'Shield',
    subcategories: {
      'število_airbagov': {
        name: 'Število airbagov',
        features: [
          'Airbag - voznik',
          'Airbag - sopotnik',
          'Airbag - stranski (vratni)',
          'Airbag - zavesni',
          'Airbag - kolenski'
        ]
      },
      'žarometi_in_luci': {
        name: 'Žarometi in luči',
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
      'varnostni_asistenti': {
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
      'zaščita': {
        name: 'Zaščita',
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
      'zunanjost_vse': {
        name: 'Zunanjost',
        features: [
          'Roofracks - Strešne sani',
          'Towbar - Vlecna kljuka',
          'Zasenčena stekla',
          'Privacy stekla',
          'Karbon paket zunanj',
          'Športni izpuh',
          'Automatski žarometi',
          'Označevalne luci LED'
        ]
      }
    }
  },
  'garancija_stanje': {
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
          'Garažirano',
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

// Default auto-selected features (standard on most cars)
export const DEFAULT_AUTO_SELECT_FEATURES = [
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

export { carEquipmentCategories }
