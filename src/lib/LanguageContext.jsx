import { createContext, useContext, useState, useEffect } from 'react'

const translations = {
  en: {
    // Top Header
    language: 'Language',
    currency: 'Currency',
    help: 'Help',
    contact: 'Contact',
    usedCars: 'Used Cars',
    newCars: 'New Cars',
    electricCars: 'Electric Cars',
    financing: 'Financing',
    millionsOfCars: 'millions of cars',
    // Main Header
    home: 'Home',
    browseCars: 'Browse Cars',
    sellYourCar: 'Sell Your Car',
    about: 'About',
    searchCars: 'Search cars...',
    myFavorites: 'My Favorites',
    signIn: 'Sign In',
    getStarted: 'Register',
    signOut: 'Sign Out',
    myDashboard: 'My Dashboard',
    messages: 'Messages',
    // Footer
    allRightsReserved: 'All rights reserved',
    // Common
    EUR: 'EUR',
    // Car Details
    year: 'Year',
    mileage: 'Mileage',
    fuelType: 'Fuel Type',
    transmission: 'Transmission',
    engine: 'Engine',
    power: 'Power',
    color: 'Color',
    bodyType: 'Body Type',
    price: 'Price',
    monthlyPayment: '/month',
    contactSeller: 'Contact Seller',
    sendMessage: 'Send Message',
    yourMessage: 'Your message...',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    viber: 'Viber',
    verified: 'Verified',
    seller: 'Seller',
    views: 'Views',
    posted: 'Posted',
    financingAvailable: 'Financing Available',
    financingDetails: 'Financing Details',
    monthlyBudget: 'Monthly Budget',
    downPayment: 'Down Payment',
    callNow: 'Call Now',
    messageSent: 'Message sent!',
    // Sell Page
    sellTitle: 'Sell Your Car',
    sellSubtitle: 'Get the best price for your car',
    basicInfo: 'Basic Information',
    brand: 'Brand',
    model: 'Model',
    yearOfProduction: 'Year of Production',
    mileage_label: 'Mileage (km)',
    fuelType_label: 'Fuel Type',
    transmission_label: 'Transmission',
    bodyType_label: 'Body Type',
    city_label: 'City',
    price_label: 'Price (€)',
    title_label: 'Title',
    description_label: 'Description',
    photos: 'Photos',
    addPhotos: 'Add Photos',
    next: 'Next',
    previous: 'Previous',
    publish: 'Publish',
    selectBrand: 'Select Brand',
    selectCity: 'Select City',
    selectFuel: 'Select Fuel',
    selectTransmission: 'Select Transmission',
    selectBodyType: 'Select Body Type',
    buy: 'Buy',
  },
  sl: {
    // Top Header
    language: 'Jezik',
    currency: 'Valuta',
    help: 'Pomoč',
    contact: 'Kontakt',
    usedCars: 'Rabljena vozila',
    newCars: 'Nova vozila',
    electricCars: 'Električna vozila',
    
    millionsOfCars: 'milijonov vozil',
    // Main Header
    home: 'Domov',
    browseCars: 'Pregled vozil',
    sellYourCar: 'Prodajte svoje vozilo',
    about: 'O nas',
    searchCars: 'Išči vozila...',
    myFavorites: 'Priljubljeni',
    signIn: 'Prijava',
    getStarted: 'Registracija',
    signOut: 'Odjava',
    myDashboard: 'Moja plošča',
    messages: 'Sporočila',
    // Footer
    allRightsReserved: 'Vse pravice pridržane',
    // Common
    EUR: 'EUR',
    // Car Details
    year: 'Leto',
    mileage: 'Kilometri',
    fuelType: 'Gorivo',
    transmission: 'Menjalnik',
    engine: 'Motor',
    power: 'Moč',
    color: 'Barva',
    bodyType: 'Vrsta karoserije',
    price: 'Cena',
    monthlyPayment: '/mesec',
    contactSeller: 'Kontaktirajte prodajalca',
    sendMessage: 'Pošlji sporočilo',
    yourMessage: 'Vaše sporočilo...',
    phone: 'Telefon',
    whatsapp: 'WhatsApp',
    viber: 'Viber',
    verified: 'Preverjeno',
    seller: 'Prodajalec',
    views: 'Ogledi',
    posted: 'Objavljeno',
    financingAvailable: 'Financiranje na voljo',
    financingDetails: 'Podrobnosti financiranja',
    monthlyBudget: 'Mesečni proračun',
    downPayment: 'Polog',
    callNow: 'Pokličite zdaj',
    messageSent: 'Sporočilo poslano!',
    // Sell Page
    sellTitle: 'Prodajte svoje vozilo',
    sellSubtitle: 'Dobite najboljšo ceno za svoje vozilo',
    basicInfo: 'Osnovni podatki',
    brand: 'Znamka',
    model: 'Model',
    yearOfProduction: 'Leto proizvodnje',
    mileage_label: 'Kilometri (km)',
    fuelType_label: 'Vrsta goriva',
    transmission_label: 'Menjalnik',
    bodyType_label: 'Vrsta karoserije',
    city_label: 'Mesto',
    price_label: 'Cena (€)',
    title_label: 'Naslov',
    description_label: 'Opis',
    photos: 'Fotografije',
    addPhotos: 'Dodaj fotografije',
    next: 'Naprej',
    previous: 'Nazaj',
    publish: 'Objavi',
    selectBrand: 'Izberite znamko',
    selectCity: 'Izberite mesto',
    selectFuel: 'Izberite gorivo',
    selectTransmission: 'Izberite menjalnik',
    selectBodyType: 'Izberite vrsto karoserije',
    buy: 'Kupi',
    // Add Car Page
    addCarTitle: 'Dodaj novo vozilo',
    editCarTitle: 'Uredi vozilo',
    carTitle: 'Naslov vozila',
    carTitlePlaceholder: 'npr. BMW X5 M Sport',
    selectBrandPlaceholder: 'Izberi znamko',
    modelPlaceholder: 'npr. X5',
    yearPlaceholder: '2024',
    pricePlaceholder: '50000',
    cityPlaceholder: 'Vnesite mesto',
    mileagePlaceholder: 'npr. 50000',
    enginePlaceholder: 'npr. 2.0 TDI',
    horsepowerPlaceholder: 'npr. 150',
    colorPlaceholder: 'npr. Bela',
    descriptionPlaceholder: 'Opis vozila...',
    // Financing
    
    financingEnabled: 'Omogočeno financiranje',
    monthlyPaymentLabel: 'Mesečni obrok (€)',
    monthlyPaymentPlaceholder: 'npr. 250',
    downPaymentType: 'Vrsta pologa',
    downPaymentPercent: 'Odstotek pologa (%)',
    downPaymentAmount: 'Znesek pologa (€)',
    percent: 'Odstotek (%)',
    amount: 'Znesek (€)',
    // Photos
    photosLabel: 'Fotografije',
    addPhoto: 'Dodaj',
    standard: 'standard',
    hd360: 'HD + 360°',
    // Submit
    publishCar: 'Objavi vozilo',
    updateCar: 'Posodobi vozilo',
    freePublish: 'Objavi vozilo (Brezplačno)',
    buyPackage: 'Kupi paket za nadaljevanje',
    limitReached: 'Dosegli ste limit 2 brezplačnih vozil. Kupite paket za dodajanje več.',
    requiredFields: 'Prosimo izpolnite vsa obvezna polja',
    maxPhotos: 'Vaša paket dovoljuje največ X fotografij.',
    // Body Types
    suv: 'Traktor',
    sedan: 'Sedan',
    karavan: 'Karavan',
    hatchback: 'Hatchback',
    kupe: 'Kupe',
    pickup: 'Pickup',
    // Fuel Types
    bencin: 'Bencin',
    dizel: 'Dizel',
    elektricni: 'Električni',
    hibridni: 'Hibridni',
    // Transmission
    rocni: 'Ročni',
    avtomatski: 'Avtomatski',
  },
  hr: {
    // Top Header
    language: 'Jezik',
    currency: 'Valuta',
    help: 'Pomoć',
    contact: 'Kontakt',
    usedCars: 'Rabljena vozila',
    newCars: 'Nova vozila',
    electricCars: 'Električna vozila',
    
    millionsOfCars: 'milijuna vozila',
    // Main Header
    home: 'Početna',
    browseCars: 'Pregled vozila',
    sellYourCar: 'Prodajte svoje vozilo',
    about: 'O nama',
    searchCars: 'Traži vozilo...',
    myFavorites: 'Favoriti',
    signIn: 'Prijava',
    getStarted: 'Registracija',
    signOut: 'Odjava',
    myDashboard: 'Moja ploča',
    messages: 'Poruke',
    // Footer
    allRightsReserved: 'Sva prava pridržana',
    // Common
    EUR: 'EUR',
    // Car Details
    year: 'Godina',
    mileage: 'Kilometra',
    fuelType: 'Gorivo',
    transmission: 'Mjenjač',
    engine: 'Motor',
    power: 'Snaga',
    color: 'Boja',
    bodyType: 'Vrsta karoserije',
    price: 'Cijena',
    monthlyPayment: '/mjesec',
    contactSeller: 'Kontaktirajte prodavača',
    sendMessage: 'Pošalji poruku',
    yourMessage: 'Vaša poruka...',
    phone: 'Telefon',
    whatsapp: 'WhatsApp',
    viber: 'Viber',
    verified: 'Provjereno',
    seller: 'Prodavač',
    views: 'Pregledi',
    posted: 'Objavljeno',
    financingAvailable: 'Financiranje dostupno',
    financingDetails: 'Detalji financiranja',
    monthlyBudget: 'Mjesečni proračun',
    downPayment: 'Polog',
    callNow: 'Nazovite sada',
    messageSent: 'Poruka poslana!',
    // Sell Page
    sellTitle: 'Prodajte svoje vozilo',
    sellSubtitle: 'Najbolja cijena za vaše vozilo',
    basicInfo: 'Osnovni podaci',
    brand: 'Marka',
    model: 'Model',
    yearOfProduction: 'Godina proizvodnje',
    mileage_label: 'Kilometri (km)',
    fuelType_label: 'Vrsta goriva',
    transmission_label: 'Mjenjač',
    bodyType_label: 'Vrsta karoserije',
    city_label: 'Grad',
    price_label: 'Cijena (€)',
    title_label: 'Naslov',
    description_label: 'Opis',
    photos: 'Fotografije',
    addPhotos: 'Dodaj fotografije',
    next: 'Dalje',
    previous: 'Natrag',
    publish: 'Objavi',
    selectBrand: 'Odaberite marku',
    selectCity: 'Odaberite grad',
    selectFuel: 'Odaberite gorivo',
    selectTransmission: 'Odaberite mjenjač',
    selectBodyType: 'Odaberite vrstu karoserije',
    buy: 'Kupi',
  }
}

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('sl') // Default to Slovenian, avoid hydration mismatch
  const [mounted, setMounted] = useState(false)

  // Read from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const saved = localStorage.getItem('language')
    if (saved && (saved === 'sl' || saved === 'en' || saved === 'hr')) {
      setLanguage(saved)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('language', language)
    }
  }, [language, mounted])

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'sl' : 'en')
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
