// Data helpers - fetches from Supabase only

// Supabase configuration

const SUPABASEURL = 'https://pajbxchnenouxeaimsdr.supabase.co'

const SUPABASEKEY = 'sb_publishable_CQVFr7jAHNfQV5DXvxQiZg_h7Cq6MRH'



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

  { value: 'Vokvari', label: 'V okvari', description: 'vendar NI karambolirano' },

]



// Vehicle condition sub options

export const vehicleConditionSubOptions = {

  'Vozno': [

    { id: 'neposkodovano', label: 'NEpoškodovano' },

    { id: 'nikarambolirano', label: 'Ni karambolirano' },

  ],

  'NEvozno': [

    { id: 'poskodovano', label: 'poškodovano' },

    { id: 'karambolirano', label: 'karambolirano' },

  ],

  'Vokvari': [

    { id: 'poplavljeno', label: 'vozilo je bilo poplavijeno' },

    { id: 'okvara_motorja', label: 'okvara motorja' },

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

  { value: '5let', label: '5 let ali več' },

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

export const FALLBACKBRANDS = [
  // Premium German
  'Audi', 'BMW', 'Mercedes-Benz', 'Porsche', 'Volkswagen',
  // Other European
  'Opel', 'Smart', 'Ford', 'Fiat', 'Alfa Romeo', 'Lancia', 'Maserati',
  'Peugeot', 'Citroen', 'Renault', 'DS', 'Dacia',
  'Jaguar', 'Land Rover', 'Mini', 'Bentley', 'Rolls-Royce', 'Aston Martin', 'McLaren',
  'Volvo', 'Saab', 'Skoda', 'Seat', 'Cupra',
  'Lada', 'ZAZ', 'UAZ',
  // Japanese
  'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki', 'Lexus', 'Acura', 'Infiniti', 'Daihatsu', 'Hino', 'Toyota ProAce',
  // Korean
  'Hyundai', 'Kia', 'Genesis', 'SsangYong',
  // American
  'Chevrolet', 'Dodge', 'Jeep', 'Chrysler', 'Cadillac', 'Lincoln', 'GMC', 'Buick', 'Ram', 'Tesla', 'Rivian', 'Lucid',
  // Chinese
  'BYD', 'Chery', 'Geely', 'Great Wall', 'NIO', 'Xpeng', 'Li Auto',
  // Indian
  'Tata', 'Mahindra', 'Maruti Suzuki',
  // Turkish
  'Anadolu Isuzu', 'BMC',
  // Trucks/Commercial
  'MAN', 'Scania', 'Iveco', 'DAF', 'Volvo Trucks', 'Renault Trucks', 'Fuso', 'Isuzu', 'Hino',
  // Agricultural
  'John Deere', 'Massey Ferguson', 'Case IH', 'New Holland', 'Fendt', 'Kubota', 'Claas', 'Deutz-Fahr', 'Valtra', 'Steyr', 'JCB', 'McCormick', 'Landini', 'Zetor', 'SAME', 'Agrale', 'Belarus', 'MTZ', 'YTO',
  // Other
  'Polestar', 'Fisker',
]

export const FALLBACKMODELS = {}





// Luxury car threshold and fee

export const LUXURYCARTHRESHOLD = 50000
export const LUXURYFEE = 5

// Category-specific brands
export const CATEGORY_BRANDS = {
  avto: [
    'Audi', 'BMW', 'Mercedes-Benz', 'Porsche', 'Volkswagen',
    'Opel', 'Smart', 'Ford', 'Fiat', 'Alfa Romeo', 'Lancia', 'Maserati',
    'Peugeot', 'Citroen', 'Renault', 'DS', 'Dacia',
    'Jaguar', 'Land Rover', 'Mini', 'Bentley', 'Rolls-Royce', 'Aston Martin', 'McLaren',
    'Volvo', 'Saab', 'Skoda', 'Seat', 'Cupra',
    'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki', 'Lexus', 'Acura', 'Infiniti',
    'Hyundai', 'Kia', 'Genesis', 'SsangYong',
    'Chevrolet', 'Dodge', 'Jeep', 'Chrysler', 'Cadillac', 'Lincoln', 'GMC', 'Buick', 'Ram', 'Tesla', 'Rivian', 'Lucid',
    'BYD', 'Chery', 'Geely', 'Great Wall', 'NIO', 'Xpeng', 'Li Auto',
    'Tata', 'Mahindra', 'Maruti Suzuki',
    'Polestar', 'Fisker', 'Lada',
  ],
  moto: [
    'Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Ducati', 'Harley-Davidson',
    'KTM', 'Triumph', 'Aprilia', 'Moto Guzzi', 'MV Agusta', 'Benelli',
    'Zontes', 'CFMoto', 'Royal Enfield', 'Bajaj', 'TVS',
  ],
  kamion: [
    'MAN', 'Scania', 'Iveco', 'DAF', 'Volvo Trucks', 'Mercedes-Benz Trucks', 'Renault Trucks', 'Fuso', 'Isuzu', 'Hino',
    'Anadolu Isuzu', 'BMC',
  ],
  kombi: [
    'Volkswagen', 'Mercedes-Benz', 'Ford', 'Fiat', 'Renault', 'Peugeot', 'Citroen', 'Opel', 'Iveco', 'Nissan',
    'Toyota', 'Hyundai',
  ],
  traktor: [
    'John Deere', 'Massey Ferguson', 'Case IH', 'New Holland', 'Fendt', 'Kubota', 'Claas', 'Deutz-Fahr',
    'Valtra', 'Steyr', 'JCB', 'McCormick', 'Landini', 'Zetor', 'SAME', 'Lamborghini Tr.', 'Agrale',
    'Belarus', 'MTZ', 'YTO', 'Dongfeng', 'Mahindra Tr.', 'Farmtrac', 'Force Motors',
  ],
  avtodom: [
    'Volkswagen', 'Mercedes-Benz', 'Ford', 'Fiat', 'Hymer', 'Burstner', 'Carthago', 'Trigano', 'Pilote', 'Hyundai',
    'Karmann', 'Adria', 'Weinsberg', 'Rapido', 'Compassi',
  ],
}

// Slavenian cities// Slavenian cities

export const slovenianCities = [
  'Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Koper', 'Nova Gorica',
  'Krško', 'Novo Mesto', 'Ptuj', 'Trbovlje', 'Kamnik', 'Jesenice', 'Šentjur',
  'Škofja Loka', 'Bled', 'Bohinj', 'Brežice', 'Cerklje ob Krki', 'Cerknica',
  'Cerkno', 'Črnomelj', 'Dravograd', 'Gornja Radgona', 'Grosuplje', 'Hrastnik',
  'Idrija', 'Ilirska Bistrica', 'Izola', 'Jurovski Dol', 'Kanal ob Soči',
  'Kočevje', 'Komen', 'Kozina', 'Kranjska Gora', 'Lendava', 'Litija', 'Logatec',
  'Metlika', 'Mežica', 'Murska Sobota', 'Muta', ' Nazar', 'Ormož', 'Piran',
  'Postojna', 'Prevalje', 'Radeče', 'Radlje ob Dravi', 'Radovljica', 'Ravne na Koroškem',
  'Ribnica', 'Rogaška Slatina', 'Rogatec', 'Ruše', 'Sežana', 'Slovenska Bistrica',
  'Slovenske Konjice', 'Tolmin', 'Trebnje', 'Tržič', 'Turnišče', 'Velenje', 'Vinica',
  'Vipava', 'Vitanje', 'Vodice', 'Velenje', 'Zagorje ob Savi', 'Zreče', 'Železniki',
  'Ajdovščina', 'Ankaran', 'Benedikt', 'Borovnica', 'Bovec', 'Braslovče', 'Brda',
  'Brezovica', 'Cankova', 'Destrnik', 'Divača', 'Dobje', 'Dobrna', 'Dobrova-Polhov Gradec',
  'Dol pri Ljubljani', 'Dolenjske Toplice', 'Domžale', 'Duplek', 'Gorenja vas-Poljane',
  'Gorišnica', 'Gorje', 'Gornji Grad', 'Gornji Petrovci', 'Grad', 'Hajdina', 'Hoče-Slivnica',
  'Hodoš', 'Horjul', 'Hraše', 'Hrpelje-Kozina', 'Ivančna Gorica', 'Juršinci', 'Kabinet',
  'Kobilje', 'Kidričevo', 'Komen', 'Komers', 'Kostel', 'Kozje', 'Križevci', 'Kron',
  'Kungota', 'Kuzma', 'Laško', 'Lovrenc na Pohorju', 'Loška dolina', 'Loški Potok',
  'Lukovica', 'Majšperk', 'Makole', ' Markovci', 'Medvode', 'Mengeš', 'Miklavž na Dravskem polju',
  'Mirna', 'Mirna Peč', 'Mislinja', 'Mokronog-Trebelno', 'Moravče', 'Moravske Toplice',
  'Mozelj', 'Murska Sobota', 'Naklo', 'Nazarine', 'Odranci', 'Oplotnica', 'Pesnica',
  'Pivka', 'Podčetrtek', 'Podlehnik', 'Podvelka', 'Poljčane', 'Prebold', 'Preddvor',
  'Prevalje', 'Puconci', 'Rače-Fram', 'Rakičan', 'Renč-Vogrsko', 'Rečica ob Savinji',
  'Rečje', 'Semič', 'Sevnica', 'Sežana', 'Spir', 'Starše', 'Sveta Ana', 'Sveta Trojica v Slovenskih goricah',
  'Sveti Jurij ob Scavnici', 'Sveti Andraž v Slovenskih goricah', 'Šempeter-Vrtojba', 'Šmarje pri Jelšah',
  'Šmarješke Toplice', 'Šmartno ob Paki', 'Šmartno na Pohorju', 'Šoštanj', 'Štore',
  'Trnovska vas', 'Trzin', 'Tržin', 'Velika Polana', 'Veržej', 'Videm', 'Vojnik',
  'Vransko', 'Vrhnika', 'Zabrd', 'Zavrč', 'Zelenika', 'Zreče', 'Žalec', 'Žirovnica',
  'Žetale', 'Žiri', 'Žubin', 'Žužemberk'
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

      'UTV Vozila',

    ]

  },

  'kombi': {

    label: 'Izberite podrubriko',

    options: [

      'Dostavna vozila',

      'Tovorna vozila',

      'Avtobusi',

      'Tovorne prikolice',

      'UTV Vozila',

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

      'Sneljivi bivalnik',

      'Šotorska prikolica',

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

      'ž asija s kabino',

      'ž asija z nadgradnjo',

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

  'UTV Vozila': {

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

  // Traktor - Viličarjiarji

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

  'Počitniška prikolica': {

    label: 'Vrsta počitniške prikolice',

    options: [] // No subcategories

  },

  'Mobilna hišica': {

    label: 'Vrsta mobilne hišice',

    options: [] // No subcategories

  },

  'Sneljivi bivalnik': {

    label: 'Vrsta snemljivega bivalnika',

    options: [] // No subcategories

  },

  'Šotorska prikolica': {

    label: 'Vrsta šotorske prikolice',

    options: [] // No subcategories

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

  'UTV Vozila': {

    label: 'Vrsta UTV vozila',

    options: [

      'ATV',

      'UTV Vozila',

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

      'Sneljivi bivalnik',

      'Šotorska prikolica',

      ]

  },

}



// Brands and default models - empty, data from Supabase

export const brands = FALLBACKBRANDS

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

          'Električni pomik prednjih stekel',

          'Električni pomik prednjih in zadnjih stekel',

          'El. nastavijiva zunanja ogledala',

          'Ogrevanje zunanjih ogledal',

          'El. zlozijiva zunanja ogledala',

          'Centralno zaklepanje',

          'Centralno zaklepanje z daljinskim',

          'Soft-Close sistem zapiranja',

          'Sencni rolo za zadnje steklo',

          'Keyless Go',

          'Start-Stop sistem',

          'Električni paket',

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

      'uporabnostvse': {

        name: 'Uporabnost',

        features: [

          'Deljiva zad.klop Š - Š',

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

  'sedežiinvrata': {

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

      'oblogevrat': {

        name: 'Obloge vrat',

        features: [

          'Obloga vrat - les',

          'Obloga vrat - aluminij',

          'Obloga vrat - karbon',

          'Obloga vrat - krom'

        ]

      },

      'številovrat': {

        name: 'ž tevilo vrat',

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

          'ž portno podvozje',

          'Aktivno vzmetenje (ABC - Active Body Control)',

          'Zracno vzmetenje',

          'ž tirikolesni pogon (4x4 / 4WD / Quattro)'

        ]

      }

    }

  },

  'varnost': {

    name: 'Varnost',

    icon: 'Shield',

    subcategories: {

      'številoairbagov': {

        name: 'ž tevilo airbagov',

        features: [

          'Airbag - voznik',

          'Airbag - sopotnik',

          'Airbag - stranski (vratni)',

          'Airbag - zavesni',

          'Airbag - kolenski'

        ]

      },

      'žarometiinluci': {

        name: 'Šentjurarometi in luči',

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

      'zunanjostvse': {

        name: 'Zunanjost',

        features: [

          'Roofracks - Strešne sani',

          'Towbar - Vlecna kljuka',

          'Zasenčena stekla',

          'Privacy stekla',

          'Karbon paket zunanj',

          'ž portni izpuh',

          'Automatski žarometi',

          'Označevalne luci LED'

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



// Equipment for MOTOR (motorcycles)

const motorEquipmentCategories = {

  'motoroprema': {

    name: 'Oprema',

    icon: 'Settings',

    subcategories: {

      'motoropremavse': {

        name: 'Oprema',

        features: [

          'ž portni izpuh',

          'ABS zavorni sistem',

          'Protizdrsni sistem (TCS)',

          'Nadzor tlaka v pnevmatikah (RDC)',

          'Elektronsko nastavljivo vzmetenje (ESA)',

          'Vzvratna prestava',

          'Tempomat',

          'Varnostni zaščitni loki',

          'Katalizator',

          '12V vtičnica',

          'Alarmna naprava',

          'Kodno varovan vžig motorja',

          'Radio',

          'Nastavljiv sedež po višini',

          'Gretje sedeža',

          'Gretje ročic krmila',

          'Stabilizator krmila',

          'Prtljažni kovček',

          'Stranski kovček',

          'Vetrna zaščita',

          'Navigacija',

          'Airbag',

          'Meglenke',

          'Potovalni računalnik',

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

  'Električni pomik prednjih stekel',

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

          'Pomoč pri zaviranju BAS',

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

          'ž tevilo airbagov',

          'Nadzor zračnega tlaka v pnevmatikah (RDK)',

          'Senzor za dež',

          'Xenonski žarometi',

          'Meglenke',

          'Naprava za pranje žarometov',

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

          'Sedeži: komfortni',

          'Sedeži: ortopedski',

          'Sedeži: nastavitev po višini',

          'Sedeži: el. nastavitev',

          'Sedeži: paket Memory',

          'Sedeži: gretje',

          'Sedeži: hlajenje / ventilacija',

          'Sredinski naslon za roko med sedeži',

          'Zložljiv sovoznikov sedež',

          'Sovoznik: sedež za 2 osebi',

          'Servisna knjiga potrjena',

          'Garažirano',

          'Nepoškodovano',

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

          'Klimatska naprava - ročna',

          'Avtomatska klimatska naprava / digitalna',

          'Klimatska naprava - 2 conska',

          'Webasto',

          'Tonirana stekla',

          'Električni pomik prednjih stekel',

          'El. nastavljiva zunanja ogledala',

          'Ogrevanje zunanjih ogledal',

          'Centralno zaklepanje',

          'Električni paket',

          'Nastavljiv volan po višini',

          'Nastavljiv volan po globini',

          'Servo volan',

          'Volanski obroč oblečen v usnje',

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

          'Potovalni računalnik',

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

          'ž portni izpuh',

          'ABS zavorni sistem',

          'Protizdrsni sistem (TCS)',

          'Nadzor tlaka v pnevmatikah (RDC)',

          'Elektronsko nastavljivo vzmetenje (ESA)',

          'Vzvratna prestava',

          'Tempomat',

          'Varnostni zaščitni loki',

          'Katalizator',

          '12V vtičnica',

          'Alarmna naprava',

          'Kodno varovan vžig motorja',

          'Radio',

          'Nastavljiv sedež po višini',

          'Gretje sedeža',

          'Gretje ročic krmila',

          'Stabilizator krmila',

          'Prtljažni kovček',

          'Stranski kovček',

          'Vetrna zaščita',

          'Navigacija',

          'Airbag',

          'Meglenke',

          'Potovalni računalnik',

          'Custom predelava',

        ]

      }

    }

  }

}



// Tovorna prikolica - no equipment list, only form fields (dolžina, širina, osi, nosilnost, etc.)



// Equipment for KAMION (trucks / delivery vehicles) - ALL items from user list

const kamionEquipmentCategories = {

  'podvozjek': {

    name: 'Podvozje',

    icon: 'Settings',

    subcategories: {

      'podvozjekv': {

        name: 'Podvozje',

        features: [

          'Podvozje: lahka (ALU) platišča',

          'Zavorni sistem (ABS)',

          'Pomoč pri zaviranju BAS',

          'Elektronski program stabilnosti (ESP)',

          'Regulacija nivoja podvozja (ADS)',

          'Zračno vzmetenje',

          'Nadzor zibanja prikolice TSC',

          'Prilagodljiv način obremenitve LAC',

          'ž tirikolesni pogon (4x4 / 4WD)',

          'Podaljšana medosna razdalja',

          'Ojačano vzmetenje',

          'Aktivno vzmetenje (ABC)',

          'Sistem proti prevračanju RSC',

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

          'ž tevilo airbagov',

          'Nadzor zračnega tlaka v pnevmatikah (RDK)',

          'Xenonski žarometi',

          'Bi-xenonski žarometi',

          'LED žarometi',

          'Prednje (dnevne) LED luči',

          'Zadnje LED luči',

          'Meglenke',

          'Adaptive light / dinamično prilagodljivi žarometi',

          'Sistem za prepoznavo prometnih znakov',

          '3. zavorna luč',

          'Naprava za pranje žarometov',

          'Alarmna naprava',

          'Blokada motorja',

          'Kodno varovan vžig motorja',

          'Sistem za opozarjanje na mrtvi kot',

          'Senzor za dež',

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

          'Sedeži: komfortni',

          'Sedeži: ortopedski',

          'Sedeži: nastavitev po višini',

          'Sedeži: el. nastavitev',

          'Sedeži: paket Memory',

          'Sedeži: gretje',

          'Sedeži: hlajenje / ventilacija',

          'Hladilni predal',

          'Sredinski naslon za roko med sedeži',

          'Zložljiv sovoznikov sedež',

          'Sovoznik: sedež za 2 osebi',

          'Vzglavniki na vseh sedežih',

          'Pregradna stena',

          'Polica pod stropom kabine',

          'Osvetlitev tovornega prostora',

          'Zastekljen tovorni prostor',

          '12V vtičnica',

          'Spalna kabina',

          'Servisna knjiga potrjena',

          'Garažirano',

          'Nepoškodovano',

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

          'Klimatska naprava - ročna',

          'Avtomatska klimatska naprava / digitalna',

          'Klimatska naprava - 2 conska',

          'Dodatno gretje',

          'Webasto',

          'Tonirana stekla',

          'Električni pomik prednjih stekel',

          'El. nastavljiva zunanja ogledala',

          'Ogrevanje zunanjih ogledal',

          'El. zložljiva zunanja ogledala',

          'Keyless Go',

          'Centralno zaklepanje',

          'Centralno zaklepanje z dalj. upravljanjem',

          'Električni paket',

          'Nastavljiv volan po višini',

          'Nastavljiv volan po globini',

          'Servo volan',

          'Volanski obroč oblečen v usnje',

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

          'CD izmenjevalnik / strežnik',

          'MP3 predvajalnik',

          'DVD predvajalnik',

          'Trdi disk za shranjevanje podatkov',

          'USB priključek (iPod, HD, ...)',

          'TV sprejemnik / tuner',

          'Digitalni radio DAB',

          'Predpriprava za mobilni telefon',

          'Avtotelefon',

          'Potovalni računalnik',

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

          'Povišana streha kabine',

          'Dvižni rob strehe',

          'Mrežnasta pregrada tovornega prostora',

          'Strešne sani',

          'Vlečna kljuka',

          'Pomoč pri speljevanju v klanec',

          'Sistem za aktivno pomoč pri parkiranju',

          'Parkirni senzorji PDC',

          'Pomoč pri parkiranju: kamera',

          'Pomoč pri parkiranju: prednji senzorji',

          'Pomoč pri parkiranju: zadnji senzorji',

          'Pomoč pri parkiranju: pogled 360 stopinj',

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

  'UTV Vozila': kamionKamUTVEquipmentCategories,

  'Tovorne prikolice': {}, // no equipment, only form fields

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

    'Električni pomik prednjih stekel',

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

