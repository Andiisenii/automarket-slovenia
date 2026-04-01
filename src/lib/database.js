// Unified Database System for AutoMarket Slovenia
// All data is stored per-user with proper isolation

const DB_PREFIX = 'automarket_'

// API URL for MySQL backend - imported from api.js
import { API_URL } from './api';

// ============ API CALLS TO MYSQL ============

// Fetch users from MySQL database
export const usersDB = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/admin.php?action=users`, {
        headers: { 'X-Pinggy-No-Screen': 'true' }
      })
      const users = await response.json()
      return users
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  },
  
  getById: async (id) => {
    try {
      const users = await usersDB.getAll()
      return users.find(u => u.id === id)
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }
}

// Fetch cars from MySQL database  
export const carsDB = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/admin.php?action=cars`, {
        headers: { 'X-Pinggy-No-Screen': 'true' }
      })
      const cars = await response.json()
      return cars
    } catch (error) {
      console.error('Error fetching cars:', error)
      return []
    }
  },
  
  getById: async (id) => {
    try {
      const cars = await carsDB.getAll()
      return cars.find(c => c.id === id)
    } catch (error) {
      console.error('Error fetching car:', error)
      return null
    }
  }
}

// Fetch purchases from MySQL database
export const purchasesDB = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/admin.php?action=purchases`, {
        headers: { 'X-Pinggy-No-Screen': 'true' }
      })
      const purchases = await response.json()
      return purchases
    } catch (error) {
      console.error('Error fetching purchases:', error)
      return []
    }
  }
}

// Fetch all admin data at once
export const adminDB = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/admin.php?action=all`, {
        headers: { 'X-Pinggy-No-Screen': 'true' }
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching admin data:', error)
      return { users: [], cars: [], purchases: [], stats: {} }
    }
  }
}

// ============ BRANDS & MODELS DATABASE ============

export const brandsModelsDB = {
  // Get all brands with their models
  getAll: () => {
    const data = localStorage.getItem(DB_PREFIX + 'brands_models')
    return data ? JSON.parse(data) : null
  },

  // Initialize with default brands and models (only if not exists)
  initialize: (defaultData) => {
    let data = brandsModelsDB.getAll()
    if (!data) {
      localStorage.setItem(DB_PREFIX + 'brands_models', JSON.stringify(defaultData))
      data = defaultData
    }
    return data
  },

  // Add new brand with models
  addBrand: (brandName, models = []) => {
    const data = brandsModelsDB.getAll() || {}
    if (!data[brandName]) {
      data[brandName] = models
      localStorage.setItem(DB_PREFIX + 'brands_models', JSON.stringify(data))
    }
    return data
  },

  // Add model to existing brand
  addModel: (brandName, modelName) => {
    const data = brandsModelsDB.getAll() || {}
    if (data[brandName] && !data[brandName].includes(modelName)) {
      data[brandName].push(modelName)
      localStorage.setItem(DB_PREFIX + 'brands_models', JSON.stringify(data))
    } else if (!data[brandName]) {
      data[brandName] = [modelName]
      localStorage.setItem(DB_PREFIX + 'brands_models', JSON.stringify(data))
    }
    return data
  },

  // Get models for a specific brand
  getModelsForBrand: (brandName) => {
    const data = brandsModelsDB.getAll() || {}
    return data[brandName] || []
  },

  // Get all brand names
  getBrandNames: () => {
    const data = brandsModelsDB.getAll() || {}
    return Object.keys(data).sort()
  },

  // Sync with cars - add any new brands/models from cars
  syncWithCars: (cars) => {
    const data = brandsModelsDB.getAll() || {}
    let hasChanges = false
    
    cars.forEach(car => {
      if (car.brand) {
        if (!data[car.brand]) {
          data[car.brand] = []
          hasChanges = true
        }
        if (car.model && !data[car.brand].includes(car.model)) {
          data[car.brand].push(car.model)
          hasChanges = true
        }
      }
    })
    
    if (hasChanges) {
      localStorage.setItem(DB_PREFIX + 'brands_models', JSON.stringify(data))
    }
    
    return data
  }
}

// Default brands and models
export const defaultBrandsModels = {
  'Audi': ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'TT', 'R8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'SQ5', 'SQ7'],
  'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'i3', 'i4', 'iX', 'M3', 'M4', 'M5', 'M8', 'X3 M', 'X5 M', 'X6 M'],
  'Mercedes-Benz': ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'AMG GT', 'SL', 'GLC Coupe', 'GLE Coupe'],
  'Volkswagen': ['Polo', 'Golf', 'Passat', 'Arteon', 'T-Roc', 'Tiguan', 'Touareg', 'ID.3', 'ID.4', 'ID.5', 'ID.6', 'ID.7', 'Caddy', 'California', 'Transporter', 'Amarok', 'T-Cross', 'Taos', 'Jetta'],
  'Porsche': ['911', '718 Boxster', '718 Cayman', 'Panamera', 'Cayenne', 'Macan', 'Taycan', 'Carrera GT'],
  'Opel': ['Corsa', 'Astra', 'Insignia', 'Crossland X', 'Grandland X', 'Mokka', 'Combo', 'Vivaro', 'Zafira', 'Adam', 'Karl'],
  'Toyota': ['Aygo', 'Yaris', 'Corolla', 'Camry', 'Prius', 'RAV4', 'C-HR', 'Highlander', 'Land Cruiser', 'Supra', 'GR86', 'GR Yaris', 'bZ4X', 'Proace', 'Hilux', 'Tacoma', 'Tundra'],
  'Honda': ['Civic', 'Accord', 'HR-V', 'CR-V', 'Pilot', 'Odyssey', 'Ridgeline', 'Insight', 'Accord Hybrid', 'CR-V Hybrid', 'Prologue'],
  'Mazda': ['Mazda2', 'Mazda3', 'Mazda6', 'MX-5', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-60', 'CX-70', 'CX-90', 'MX-30'],
  'Nissan': ['Micra', 'Note', 'Leaf', 'Qashqai', 'Juke', 'X-Trail', 'Pathfinder', 'Navara', 'Frontier', 'Ariya', 'Z', 'GT-R'],
  'Lexus': ['UX', 'NX', 'RX', 'ES', 'IS', 'GS', 'LS', 'LC', 'LFA', 'RZ', 'TX'],
  'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'XV', 'BRZ', 'WRX', 'Ascent', 'Solterra'],
  'Mitsubishi': ['Space Star', 'Mirage', 'Attrage', 'ASX', 'Eclipse Cross', 'Outlander', 'Pajero', 'Pajero Sport', 'Triton', 'L200'],
  'Suzuki': ['Swift', 'Baleno', 'Ignis', 'S-Cross', 'Vitara', 'Jimny', 'SX4', 'Ciaz', 'Dzire', 'Ertiga', 'Carry'],
  'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Mustang', 'Puma', 'Kuga', 'Explorer', 'Edge', 'Bronco', 'Ranger', 'Maverick', 'F-150', 'Mustang Mach-E', 'Pro', 'Transit', 'Tourneo'],
  'Chevrolet': ['Spark', 'Sonic', 'Malibu', 'Impala', 'Camaro', 'Corvette', 'Trax', 'Equinox', 'Tahoe', 'Suburban', 'Colorado', 'Silverado', 'Bolt', 'Equinox EV', 'Blazer EV'],
  'Dodge': ['Charger', 'Challenger', 'Durango', 'Hornet', 'Journey', 'Caravan', 'ProMaster'],
  'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator', 'Wagoneer', 'Grand Wagoneer', 'Avenger'],
  'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'Roadster', 'Semi'],
  'Renault': ['Twingo', 'Clio', 'Captur', 'Arkana', 'Megane', 'Austral', 'Koleos', 'ZOE', 'Espace', 'Trafic', 'Kangoo', 'Master', 'Rafale', 'Symbioz'],
  'Peugeot': ['108', '208', '308', '508', '2008', '3008', '4008', '5008', 'Rifter', 'Partner', 'Expert', 'Boxer', 'e-208', 'e-2008', 'e-3008'],
  'Citroën': ['C1', 'C3', 'C4', 'C5', 'C5 X', 'C3 Aircross', 'C4 Aircross', 'C4 X', 'Berlingo', 'Spacetourer', 'Jumpy', 'Jumper', 'ë-C3', 'ë-Berlingo'],
  'Fiat': ['500', '500L', '500X', 'Panda', 'Tipo', 'Punto', 'Linea', 'Bravo', 'Stilo', 'Qubo', 'Doblò', 'Scudo', 'Ulysse', 'Topolino'],
  'Alfa Romeo': ['MiTo', 'Giulia', 'Stelvio', 'Tonale', '4C', '8C', 'GTV', 'Spider', '159', 'Brera', 'GT'],
  'Hyundai': ['i10', 'i20', 'i30', 'Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Ioniq 5', 'Kona', 'Nexo', 'Venue', 'Creta', 'Staria', 'Ioniq 6', 'Palisade', 'Stargazer'],
  'Kia': ['Picanto', 'Rio', 'Ceed', 'K5', 'EV6', 'Niro', 'Sportage', 'Sorento', 'Seltos', 'Carnival', 'Telluride', 'EV9', 'Stonic', 'ProCeed', 'XCeed'],
  'Genesis': ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80', 'Electrified G80', 'Electrified GV70'],
  'Jaguar': ['XE', 'XF', 'XJ', 'F-Pace', 'E-Pace', 'I-Pace', 'F-Type', 'E-Type', 'XK'],
  'Land Rover': ['Defender', 'Discovery', 'Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Range Rover Velar', 'Range Rover Sport SVR', 'Series', 'Freelander'],
  'Mini': ['Cooper', 'Cooper S', 'John Cooper Works', 'Countryman', 'Clubman', 'Paceman', 'Electric'],
  'Volvo': ['XC40', 'XC60', 'XC90', 'S60', 'S90', 'V60', 'V90', 'XC40 Recharge', 'C40 Recharge', 'EX90', 'EX30', 'V60 Cross Country'],
  'Skoda': ['Fabia', 'Octavia', 'Superb', 'Karoq', 'Kodiaq', 'Enyaq', 'Scala', 'Kamiq', 'Rapid', 'Roomster', 'Yeti', 'Citigo', 'Kodiaq RS', 'Enyaq Coupe', 'Elroq'],
  'Seat': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco', 'Alhambra', 'Mii', 'Arona Xperience', 'Leon Cupra', 'Leon ST'],
  'Cupra': ['Formentor', 'Ateca', 'Leon', 'Born', 'Tavascan', 'DarkRebel'],
  'Dacia': ['Sandero', 'Spring', 'Duster', 'Jogger', 'Logan', 'Lodgy', 'Doc', 'Bigster'],
  'Smart': ['EQ Fortwo', 'EQ Forfour', '#1', '#3'],
  'Chrysler': ['Pacifica', 'Voyager', '300', 'Aspen', 'Sebring', 'Crossfire', 'Town & Country'],
  'Cadillac': ['Escalade', 'XT4', 'XT5', 'XT6', 'CT4', 'CT5', 'Lyriq', 'Celestiq', 'Optiq'],
  'Buick': ['Enclave', 'Encore', 'Encore GX', 'Envista', 'LaCrosse', 'Regal', 'Verano', 'Electra'],
  'GMC': ['Sierra', 'Terrain', 'Acadia', 'Yukon', 'Canyon', 'Savana', 'Hummer EV', 'Sierra EV'],
  'Lincoln': ['Aviator', 'Corsair', 'Nautilus', 'Navigator', 'Continental', 'MKC', 'MKS', 'MKT', 'MKZ', 'Town Car'],
  'Acura': ['ILX', 'TLX', 'RLX', 'MDX', 'RDX', 'NSX', 'ZDX'],
  'Infiniti': ['Q50', 'Q60', 'Q70', 'QX50', 'QX60', 'QX70', 'QX80', 'QX55'],
  'Maserati': ['Ghibli', 'Quattroporte', 'Levante', 'MC20', 'Grecale', 'Trofeo'],
  'Bentley': ['Continental GT', 'Flying Spur', 'Bentayga', 'Mulsanne', 'Azure', 'Bacalar'],
  'Ferrari': ['Roma', 'Portofino', 'F8 Tributo', '812 Superfast', 'SF90 Stradale', '296 GTB', 'Daytona SP3', 'Purosangue'],
  'Lamborghini': ['Huracan', 'Aventador', 'Urus', 'Revuelto', 'Sterrato', 'Centenario', 'Veneno'],
  'Aston Martin': ['DB11', 'DBS', 'Vantage', 'DBX', 'Valhalla', 'Valour', 'Victor'],
  'Rolls-Royce': ['Phantom', 'Ghost', 'Spectre', 'Cullinan', 'Wraith', 'Dawn', 'Boat Tail'],
  'McLaren': ['720S', '750S', '765LT', 'Artura', 'GT', 'Speedtail', 'Senna', 'P1'],
  'Bugatti': ['Chiron', 'Mistral', 'Bolide', 'Divo', 'Centodieci'],
  'Pagani': ['Huayra', 'Utopia', 'Zonda', 'Imola'],
  'Polestar': ['Polestar 1', 'Polestar 2', 'Polestar 3', 'Polestar 4', 'Polestar 5'],
  'Lucid': ['Air', 'Gravity'],
  'Rivian': ['R1T', 'R1S', 'R2', 'R3', 'EDV'],
  'DS': ['DS 3', 'DS 4', 'DS 7', 'DS 9', 'E-Tense'],
}

// ============ CITIES DATABASE ============

export const citiesDB = {
  // Get all cities
  getAll: () => {
    const data = localStorage.getItem(DB_PREFIX + 'cities')
    return data ? JSON.parse(data) : null
  },

  // Initialize with default cities
  initialize: (defaultCities) => {
    let data = citiesDB.getAll()
    if (!data) {
      localStorage.setItem(DB_PREFIX + 'cities', JSON.stringify(defaultCities))
      data = defaultCities
    }
    return data
  },

  // Add new city
  addCity: (cityName) => {
    const data = citiesDB.getAll() || []
    if (!data.includes(cityName)) {
      data.push(cityName)
      localStorage.setItem(DB_PREFIX + 'cities', JSON.stringify(data.sort()))
    }
    return data
  },

  // Sync with cars - add any new cities from cars
  syncWithCars: (cars) => {
    let data = citiesDB.getAll() || []
    let hasChanges = false
    
    cars.forEach(car => {
      if (car.city && !data.includes(car.city)) {
        data.push(car.city)
        hasChanges = true
      }
    })
    
    if (hasChanges) {
      localStorage.setItem(DB_PREFIX + 'cities', JSON.stringify(data.sort()))
    }
    
    return data
  }
}

// Default Slovenian cities
export const defaultCities = [
  'Ljubljana', 'Maribor', 'Koper', 'Celje', 'Kranj', 'Novo Mesto', 'Ptuj', 'Trbovlje',
  'Kamnik', 'Nova Gorica', 'Velenje', 'Izola', 'Murska Sobota', 'Postojna', 'Logatec',
  'Vrhnika', 'Slovenj Gradec', 'Brežice', 'Ajdovščina', 'Rogaška Slatina',
  'Slovenska Bistrica', 'Žreče', 'Tolmin', 'Radlje ob Dravi', 'Medvode', 'Litija',
  'Sevnica', 'Škofja Loka', 'Pivka', 'Hrastnik', 'Tržič', 'Inzko', 'Bovec',
  'Cerknica', 'Šoštanj', 'Muta', 'Gornja Radgona', 'Lenart v Slovenskih Goricah',
  'Polzela', 'Prebold', 'Žiri', 'Ribnica', 'Lovrenc na Pohorju', 'Mozirje',
  'Zagorje ob Savi', 'Ravne na Koroškem', 'Šmartno pri Slovenj Gradcu'
]

// ============ USER DATABASE ============

export const userDB = {
  // Get current logged-in user
  getCurrentUser: () => {
    const data = localStorage.getItem(DB_PREFIX + 'current_user')
    return data ? JSON.parse(data) : null
  },

  // Set current logged-in user
  setCurrentUser: (user) => {
    localStorage.setItem(DB_PREFIX + 'current_user', JSON.stringify(user))
  },

  // Get all registered users
  getAllUsers: () => {
    const data = localStorage.getItem(DB_PREFIX + 'users')
    return data ? JSON.parse(data) : []
  },

  // Register new user
  registerUser: (userData) => {
    const users = userDB.getAllUsers()
    
    // Check if email exists
    if (users.find(u => u.email === userData.email)) {
      return { error: 'Email already exists' }
    }
    
    const newUser = {
      id: Date.now(),
      email: userData.email,
      name: userData.name,
      username: userData.username || '',
      phone: userData.phone || '',
      address: userData.address || '',
      city: userData.city || '',
      hasWhatsapp: userData.hasWhatsapp || false,
      hasViber: userData.hasViber || false,
      hasPhone: userData.hasPhone !== false,
      profilePhoto: userData.profilePhoto || null,
      role: userData.role || 'buyer',
      userType: userData.userType || 'private', // 'private' or 'business'
      joinedAt: new Date().toISOString().split('T')[0],
    }
    
    users.push(newUser)
    localStorage.setItem(DB_PREFIX + 'users', JSON.stringify(users))
    
    // Set as current user
    userDB.setCurrentUser(newUser)
    
    return newUser
  },

  // Login user
  loginUser: (email, password, username = '') => {
    const users = userDB.getAllUsers()
    const user = users.find(u => u.email === email)
    
    if (!user) {
      return { error: 'User not found' }
    }
    
    // Set as current user
    userDB.setCurrentUser(user)
    
    return user
  },

  // Logout user
  logoutUser: () => {
    localStorage.removeItem(DB_PREFIX + 'current_user')
  },

  // Update user profile
  updateUser: (updates) => {
    const currentUser = userDB.getCurrentUser()
    if (!currentUser) return null
    
    const updatedUser = { ...currentUser, ...updates }
    userDB.setCurrentUser(updatedUser)
    
    // Update in users list
    const users = userDB.getAllUsers()
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u)
    localStorage.setItem(DB_PREFIX + 'users', JSON.stringify(updatedUsers))
    
    return updatedUser
  },

  // Get user by ID
  getUserById: (id) => {
    const users = userDB.getAllUsers()
    return users.find(u => u.id === id) || null
  },
  
  // Async: Get all users from MySQL API
  getAllUsersAsync: async () => {
    try {
      const response = await fetch(`${API_URL}/admin.php?action=users`, {
        headers: { 'X-Pinggy-No-Screen': 'true' }
      })
      const users = await response.json()
      return users
    } catch (error) {
      console.error('Error fetching users from MySQL:', error)
      return userDB.getAllUsers() // Fallback to localStorage
    }
  }
}

// ============ PACKAGE DATABASE ============

export const packageDB = {
  // Get package for current user
  getCurrentPackage: () => {
    const user = userDB.getCurrentUser()
    if (!user) return null
    
    const data = localStorage.getItem(DB_PREFIX + 'package_' + user.id)
    return data ? JSON.parse(data) : null
  },

  // Purchase/activate package for current user
  setPackage: (packageData) => {
    const user = userDB.getCurrentUser()
    if (!user) return
    
    const pkg = {
      ...packageData,
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + packageData.duration * 24 * 60 * 60 * 1000).toISOString(),
    }
    
    localStorage.setItem(DB_PREFIX + 'package_' + user.id, JSON.stringify(pkg))
    return pkg
  },

  // Check if user has active package
  hasActivePackage: () => {
    const pkg = packageDB.getCurrentPackage()
    if (!pkg) return false
    return new Date(pkg.expiresAt) > new Date()
  },

  // Check if premium
  isPremium: () => {
    const pkg = packageDB.getCurrentPackage()
    return pkg?.packageId === 'premium'
  }
}

// ============ CAR DATABASE ============

export const carDB = {
  // Get all cars from marketplace (for browsing)
  getAllCars: () => {
    const data = localStorage.getItem(DB_PREFIX + 'cars')
    return data ? JSON.parse(data) : []
  },

  // Get cars added by current user
  getMyCars: () => {
    const user = userDB.getCurrentUser()
    if (!user) return []
    
    const allCars = carDB.getAllCars()
    return allCars.filter(car => car.userId === user.id)
  },

  // Add new car
  addCar: (carData) => {
    const user = userDB.getCurrentUser()
    if (!user) return null
    
    const newCar = {
      id: Date.now(),
      userId: user.id,
      seller: {
        name: user.name,
        phone: user.phone,
        userType: user.userType,
        id: user.id,
      },
      ...carData,
      views: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
    }
    
    const allCars = carDB.getAllCars()
    allCars.push(newCar)
    localStorage.setItem(DB_PREFIX + 'cars', JSON.stringify(allCars))
    
    return newCar
  },

  // Update car (only if owner)
  updateCar: (carId, updates) => {
    const user = userDB.getCurrentUser()
    if (!user) return null
    
    const allCars = carDB.getAllCars()
    const index = allCars.findIndex(c => c.id === carId && c.userId === user.id)
    
    if (index === -1) return null
    
    allCars[index] = { ...allCars[index], ...updates }
    localStorage.setItem(DB_PREFIX + 'cars', JSON.stringify(allCars))
    
    return allCars[index]
  },

  // Delete car (only if owner)
  deleteCar: (carId) => {
    const user = userDB.getCurrentUser()
    if (!user) return false
    
    const allCars = carDB.getAllCars()
    const filtered = allCars.filter(c => !(c.id === carId && c.userId === user.id))
    localStorage.setItem(DB_PREFIX + 'cars', JSON.stringify(filtered))
    
    return true
  },

  // Get car by ID
  getCarById: (carId) => {
    const allCars = carDB.getAllCars()
    return allCars.find(c => c.id === parseInt(carId)) || null
  },

  // Get promoted cars
  getPromotedCars: () => {
    const allCars = carDB.getAllCars()
    return allCars.filter(car => car.promoted && car.status === 'active')
  },

  // Get car count for current user
  getMyCarCount: () => {
    return carDB.getMyCars().length
  },
  
  // Async: Get all cars from MySQL API
  getAllCarsAsync: async () => {
    try {
      const response = await fetch(`${API_URL}/admin.php?action=cars`, {
        headers: { 'X-Pinggy-No-Screen': 'true' }
      })
      const cars = await response.json()
      return cars
    } catch (error) {
      console.error('Error fetching cars from MySQL:', error)
      return carDB.getAllCars() // Fallback to localStorage
    }
  }
}

// ============ MESSAGE DATABASE ============

export const messageDB = {
  // Get all messages
  getAllMessages: () => {
    const data = localStorage.getItem(DB_PREFIX + 'messages')
    return data ? JSON.parse(data) : []
  },

  // Get messages for current user
  getMyMessages: () => {
    const user = userDB.getCurrentUser()
    if (!user) return []
    
    const allMessages = messageDB.getAllMessages()
    return allMessages.filter(msg => msg.toUserId === user.id || msg.fromUserId === user.id)
  },

  // Get unread message count
  getUnreadCount: () => {
    const messages = messageDB.getMyMessages()
    return messages.filter(msg => !msg.read && msg.toUserId === userDB.getCurrentUser()?.id).length
  },

  // Send message
  sendMessage: (messageData) => {
    const user = userDB.getCurrentUser()
    if (!user) return null
    
    const newMessage = {
      id: Date.now(),
      fromUserId: user.id,
      fromUserName: user.name,
      toUserId: messageData.toUserId,
      toUserName: messageData.toUserName,
      carId: messageData.carId,
      carTitle: messageData.carTitle,
      text: messageData.text,
      read: false,
      timestamp: new Date().toISOString(),
    }
    
    const allMessages = messageDB.getAllMessages()
    allMessages.push(newMessage)
    localStorage.setItem(DB_PREFIX + 'messages', JSON.stringify(allMessages))
    
    return newMessage
  },

  // Mark message as read
  markAsRead: (messageId) => {
    const allMessages = messageDB.getAllMessages()
    const index = allMessages.findIndex(m => m.id === messageId)
    
    if (index !== -1) {
      allMessages[index].read = true
      localStorage.setItem(DB_PREFIX + 'messages', JSON.stringify(allMessages))
    }
  },

  // Delete message
  deleteMessage: (messageId) => {
    const allMessages = messageDB.getAllMessages()
    const filtered = allMessages.filter(m => m.id !== messageId)
    localStorage.setItem(DB_PREFIX + 'messages', JSON.stringify(filtered))
  }
}

// ============ PAYMENT DATABASE ============

export const paymentDB = {
  // Get payment history for current user
  getPaymentHistory: () => {
    const user = userDB.getCurrentUser()
    if (!user) return []
    
    const data = localStorage.getItem(DB_PREFIX + 'payments_' + user.id)
    return data ? JSON.parse(data) : []
  },

  // Add payment record
  addPayment: (paymentData) => {
    const user = userDB.getCurrentUser()
    if (!user) return
    
    const payment = {
      id: Date.now(),
      userId: user.id,
      ...paymentData,
      timestamp: new Date().toISOString(),
      status: 'completed',
    }
    
    const history = paymentDB.getPaymentHistory()
    history.push(payment)
    localStorage.setItem(DB_PREFIX + 'payments_' + user.id, JSON.stringify(history))
    
    return payment
  },

  // Get total spent
  getTotalSpent: () => {
    const history = paymentDB.getPaymentHistory()
    return history.reduce((sum, p) => sum + (p.amount || 0), 0)
  }
}

// ============ FAVORITES DATABASE ============

export const favoritesDB = {
  // Get favorites for current user
  getMyFavorites: () => {
    const user = userDB.getCurrentUser()
    if (!user) return []
    
    const data = localStorage.getItem(DB_PREFIX + 'favorites_' + user.id)
    return data ? JSON.parse(data) : []
  },

  // Add to favorites
  addFavorite: (carId) => {
    const user = userDB.getCurrentUser()
    if (!user) return
    
    const favorites = favoritesDB.getMyFavorites()
    if (!favorites.includes(carId)) {
      favorites.push(carId)
      localStorage.setItem(DB_PREFIX + 'favorites_' + user.id, JSON.stringify(favorites))
    }
  },

  // Remove from favorites
  removeFavorite: (carId) => {
    const user = userDB.getCurrentUser()
    if (!user) return
    
    const favorites = favoritesDB.getMyFavorites()
    const filtered = favorites.filter(id => id !== carId)
    localStorage.setItem(DB_PREFIX + 'favorites_' + user.id, JSON.stringify(filtered))
  },

  // Check if car is favorite
  isFavorite: (carId) => {
    const favorites = favoritesDB.getMyFavorites()
    return favorites.includes(carId)
  },

  // Toggle favorite
  toggleFavorite: (carId) => {
    if (favoritesDB.isFavorite(carId)) {
      favoritesDB.removeFavorite(carId)
      return false
    } else {
      favoritesDB.addFavorite(carId)
      return true
    }
  }
}

// ============ SETTINGS DATABASE ============

export const settingsDB = {
  // Get settings for current user
  getSettings: () => {
    const user = userDB.getCurrentUser()
    if (!user) return {}
    
    const data = localStorage.getItem(DB_PREFIX + 'settings_' + user.id)
    return data ? JSON.parse(data) : {}
  },

  // Update settings
  updateSettings: (settings) => {
    const user = userDB.getCurrentUser()
    if (!user) return
    
    const current = settingsDB.getSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem(DB_PREFIX + 'settings_' + user.id, JSON.stringify(updated))
    
    return updated
  }
}

// ============ HELPERS ============

export const formatPrice = (price) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price)
}

export const formatNumber = (num) => {
  return new Intl.NumberFormat('de-DE').format(num)
}

export const getTimeAgo = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  
  if (diff < 60) return 'pred enim'
  if (diff < 3600) return 'pred ' + Math.floor(diff / 60) + ' minutami'
  if (diff < 86400) return 'pred ' + Math.floor(diff / 3600) + ' urami'
  if (diff < 2592000) return 'pred ' + Math.floor(diff / 86400) + ' dnevi'
  if (diff < 31536000) return 'pred ' + Math.floor(diff / 2592000) + ' meseci'
  return 'pred ' + Math.floor(diff / 31536000) + ' leti'
}
