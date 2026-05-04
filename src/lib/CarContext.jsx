import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from './supabase'

const CarContext = createContext(null)

// Helper to convert empty strings to null for numeric fields
const toNumberOrNull = (val) => {
  if (val === '' || val === null || val === undefined) return null
  const num = Number(val)
  return isNaN(num) ? null : num
}

export function CarProvider({ children }) {
  const { user } = useAuth()
  const [cars, setCars] = useState([])
  const [myListings, setMyListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCars()
  }, [user])

  const loadCars = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading cars from Supabase:', error)
        const localCars = JSON.parse(localStorage.getItem('automarket_cars') || '[]')
        setCars(localCars)
        if (user?.id) {
          const myCars = localCars.filter(c => c.userId === user.id)
          setMyListings(myCars)
        }
      } else {
        console.log('Cars loaded from Supabase:', data?.length)
        const transformedCars = (data || []).map(transformCarFromSupabase)
        setCars(transformedCars)
        if (user?.id) {
          const myCars = transformedCars.filter(c => c.userId === user.id)
          setMyListings(myCars)
        }
      }
    } catch (e) {
      console.error('Error loading cars:', e)
    } finally {
      setLoading(false)
    }
  }

  const transformCarToSupabase = (carData) => {
    return {
      user_id: toNumberOrNull(carData.userId) || carData.userId,
      vehicle_category: carData.vehicleCategory || 'avto',
      vehicle_sub_category: carData.vehicleSubCategory || null,
      vehicle_sub_category_detail: carData.vehicleSubCategoryDetail || null,
      brand: carData.brand || null,
      model: carData.model || null,
      year: toNumberOrNull(carData.year),
      price: toNumberOrNull(carData.price),
      mileage: toNumberOrNull(carData.mileage),
      fuel_type: carData.fueltype || carData.fuelType || null,
      transmission: carData.transmission || null,
      body_type: carData.bodytype || carData.bodyType || null,
      engine: carData.engine || null,
      horsepower: toNumberOrNull(carData.horsepower),
      color: carData.color || null,
      city: carData.city || null,
      description: carData.description || null,
      vehicle_condition: carData.vehicleCondition || null,
      vehicle_condition_sub: carData.vehicleConditionSub || [],
      images: carData.images || [],
      feature_ids: carData.featureIds || [],
      fuel_consumption: toNumberOrNull(carData.fuelConsumption),
      emission_class: carData.emissionClass || null,
      co2_emissions: toNumberOrNull(carData.co2Emissions),
      auto_publish_fuel_data: carData.autoPublishFuelData || false,
      vehicle_age: carData.vehicleAge || null,
      has_warranty: carData.hasWarranty || false,
      has_guarantee: carData.hasGuarantee || false,
      has_oldtimer_cert: carData.hasOldtimerCert || false,
      first_reg_month: carData.firstRegMonth || null,
      first_reg_year: toNumberOrNull(carData.firstRegYear),
      technical_valid_until: carData.technicalValidUntil || null,
      owner_count: toNumberOrNull(carData.ownerCount),
      engine_capacity: toNumberOrNull(carData.engineCapacity),
      engine_power_kw: toNumberOrNull(carData.enginePowerKw),
      cylinder_count: toNumberOrNull(carData.cylinderCount),
      engine_stroke: carData.engineStroke || null,
      diff_lock: carData.diffLock || null,
      start_type: carData.startType || null,
      airbag_count_kamion: toNumberOrNull(carData.airbagCountKamion),
      nosilnost: toNumberOrNull(carData.nosilnost),
      tovorni_prostor: toNumberOrNull(carData.tovorniProstor),
      zadnja_vrata: carData.zadnjaVrata || [],
      stranska_vrata: carData.stranskaVrata || [],
      barva_oblazinjenja: carData.barvaOblazinjenja || null,
      oblazinjenje: carData.oblazinjenje || null,
      streha_vozila: carData.strehaVozila || [],
      vin: carData.vin || null,
      dolzina: toNumberOrNull(carData.dolzina),
      sirina: toNumberOrNull(carData.sirina),
      stev_osi: toNumberOrNull(carData.stevOsi),
      dovoljena_skupna_tezza: toNumberOrNull(carData.dovoljenaSkupnaTezza),
      volumen: toNumberOrNull(carData.volumen),
      utv_engine_capacity: toNumberOrNull(carData.utvEngineCapacity),
      utv_engine_power_km: toNumberOrNull(carData.utvEnginePowerKm),
      utv_cylinder_count: toNumberOrNull(carData.utvCylinderCount),
      utv_engine_stroke: carData.utvEngineStroke || null,
      utv_diff_lock: carData.utvDiffLock || null,
      utv_start_type: carData.utvStartType || null,
      seller_name: carData.seller?.name || null,
      seller_phone: carData.seller?.phone || null,
      seller_user_type: carData.seller?.userType || null,
      seller_verified: carData.seller?.verified || false,
      views: toNumberOrNull(carData.views) || 0,
      status: carData.status || 'active',
      has_boost: carData.hasBoost || false,
      boost_package: carData.boostPackage || null,
      boost_days: toNumberOrNull(carData.boostDays),
      boost_spent: toNumberOrNull(carData.boostSpent),
      is_featured: carData.featured || false,
      is_promoted: carData.promoted || false,
      is_luxury_car: carData.isLuxuryCar || false,
      has_financing: carData.hasFinancing || false,
      monthly_budget: toNumberOrNull(carData.monthlyBudget),
      down_payment_type: carData.downPaymentType || null,
      down_payment_value: toNumberOrNull(carData.downPaymentValue),
    }
  }

  const transformCarFromSupabase = (dbCar) => {
    return {
      id: dbCar.id,
      title: dbCar.title,
      userId: dbCar.user_id,
      vehicleCategory: dbCar.vehicle_category,
      vehicleSubCategory: dbCar.vehicle_sub_category,
      vehicleSubCategoryDetail: dbCar.vehicle_sub_category_detail,
      brand: dbCar.brand,
      model: dbCar.model,
      year: dbCar.year,
      price: dbCar.price,
      mileage: dbCar.mileage,
      fueltype: dbCar.fuel_type,
      fuelType: dbCar.fuel_type,
      transmission: dbCar.transmission,
      bodytype: dbCar.body_type,
      bodyType: dbCar.body_type,
      engine: dbCar.engine,
      horsepower: dbCar.horsepower,
      color: dbCar.color,
      city: dbCar.city,
      description: dbCar.description,
      vehicleCondition: dbCar.vehicle_condition,
      vehicleConditionSub: dbCar.vehicle_condition_sub || [],
      images: dbCar.images || [],
      featureIds: dbCar.feature_ids || [],
      fuelConsumption: dbCar.fuel_consumption,
      emissionClass: dbCar.emission_class,
      co2Emissions: dbCar.co2_emissions,
      autoPublishFuelData: dbCar.auto_publish_fuel_data,
      vehicleAge: dbCar.vehicle_age,
      hasWarranty: dbCar.has_warranty,
      hasGuarantee: dbCar.has_guarantee,
      hasOldtimerCert: dbCar.has_oldtimer_cert,
      firstRegMonth: dbCar.first_reg_month,
      firstRegYear: dbCar.first_reg_year,
      technicalValidUntil: dbCar.technical_valid_until,
      ownerCount: dbCar.owner_count,
      engineCapacity: dbCar.engine_capacity,
      enginePowerKw: dbCar.engine_power_kw,
      cylinderCount: dbCar.cylinder_count,
      engineStroke: dbCar.engine_stroke,
      diffLock: dbCar.diff_lock,
      startType: dbCar.start_type,
      airbagCountKamion: dbCar.airbag_count_kamion,
      nosilnost: dbCar.nosilnost,
      tovorniProstor: dbCar.tovorni_prostor,
      zadnjaVrata: dbCar.zadnja_vrata || [],
      stranskaVrata: dbCar.stranska_vrata || [],
      barvaOblazinjenja: dbCar.barva_oblazinjenja,
      oblazinjenje: dbCar.oblazinjenje,
      strehaVozila: dbCar.streha_vozila || [],
      vin: dbCar.vin,
      dolzina: dbCar.dolzina,
      sirina: dbCar.sirina,
      stevOsi: dbCar.stev_osi,
      dovoljenaSkupnaTezza: dbCar.dovoljena_skupna_tezza,
      volumen: dbCar.volumen,
      utvEngineCapacity: dbCar.utv_engine_capacity,
      utvEnginePowerKm: dbCar.utv_engine_power_km,
      utvCylinderCount: dbCar.utv_cylinder_count,
      utvEngineStroke: dbCar.utv_engine_stroke,
      utvDiffLock: dbCar.utv_diff_lock,
      utvStartType: dbCar.utv_start_type,
      seller: {
        name: dbCar.seller_name,
        phone: dbCar.seller_phone,
        username: dbCar.seller_username,
        profile_photo: dbCar.seller_profile_photo,
        userType: dbCar.seller_user_type,
        verified: dbCar.seller_verified,
        id: dbCar.user_id,
      },
      views: dbCar.views || 0,
      createdAt: dbCar.created_at,
      status: dbCar.status,
      hasBoost: dbCar.has_boost,
      boostPackage: dbCar.boost_package,
      boostDays: dbCar.boost_days,
      boostSpent: dbCar.boost_spent,
      featured: dbCar.is_featured,
      promoted: dbCar.is_promoted,
      isLuxuryCar: dbCar.is_luxury_car,
      hasFinancing: dbCar.has_financing,
      monthlyBudget: dbCar.monthly_budget,
      downPaymentType: dbCar.down_payment_type,
      downPaymentValue: dbCar.down_payment_value,
    }
  }

  const refreshCars = async () => {
    await loadCars()
  }

  // Test function to add a sample car
  const addTestCar = async () => {
    console.log('Adding test car to Supabase...')
    const testCar = {
      user_id: user?.id || 1,
      vehicle_category: 'avto',
      brand: 'BMW',
      model: '320d',
      year: 2020,
      price: 25000,
      mileage: 50000,
      fuel_type: 'Dizel',
      transmission: 'Avtomatski',
      body_type: 'Limuzina',
      color: 'Črna',
      city: 'Ljubljana',
      description: 'Test car - BMW 320d M Sport',
      status: 'active',
      seller_name: user?.name || 'Test User',
      seller_phone: user?.phone || '+386 00 000 000',
    }
    
    const { data, error } = await supabase
      .from('cars')
      .insert(testCar)
      .select()
      .single()
    
    if (error) {
      console.error('Test car error:', error)
      alert('Test car error: ' + error.message)
    } else {
      console.log('Test car added!', data)
      alert('Test car added successfully!')
      await loadCars()
    }
  }

  const addCar = async (carData) => {
    if (!user) throw new Error('Must be logged in to add a car')
    
    // Build title from brand and model
    const title = `${carData.brand || ''} ${carData.model || ''} ${carData.year || ''}`.trim()
    
    // Insert all fields including equipment and specifications
    const allData = {
      title: title,
      user_id: user.id,
      // Images
      images: carData.images || [],
      vehicle_category: carData.vehicleCategory || 'avto',
      vehicle_sub_category: carData.vehicleSubCategory || null,
      vehicle_sub_category_detail: carData.vehicleSubCategoryDetail || null,
      brand: carData.brand || null,
      model: carData.model || null,
      year: toNumberOrNull(carData.year),
      price: toNumberOrNull(carData.price),
      mileage: toNumberOrNull(carData.mileage),
      fuel_type: carData.fuelType || null,
      transmission: carData.transmission || null,
      body_type: carData.bodyType || null,
      color: carData.color || null,
      city: carData.city || null,
      description: carData.description || null,
      // Equipment & Features
      feature_ids: carData.featureIds && carData.featureIds.length > 0 ? carData.featureIds : null,
      vehicle_condition: carData.vehicleCondition || null,
      vehicle_condition_sub: carData.vehicleConditionSub || [],
      // Specs
      engine: carData.engine || null,
      horsepower: toNumberOrNull(carData.horsepower),
      engine_capacity: toNumberOrNull(carData.engineCapacity),
      engine_power_kw: toNumberOrNull(carData.enginePowerKw),
      cylinder_count: toNumberOrNull(carData.cylinderCount),
      engine_stroke: carData.engineStroke || null,
      diff_lock: carData.diffLock || null,
      start_type: carData.startType || null,
      // Fuel
      fuel_consumption: toNumberOrNull(carData.fuelConsumption),
      emission_class: carData.emissionClass || null,
      co2_emissions: toNumberOrNull(carData.co2Emissions),
      auto_publish_fuel_data: carData.autoPublishFuelData || false,
      // Vehicle Age & Ownership
      vehicle_age: carData.vehicleAge || null,
      has_warranty: carData.hasWarranty || false,
      has_guarantee: carData.hasGuarantee || false,
      has_oldtimer_cert: carData.hasOldtimerCert || false,
      // Registration
      first_reg_month: carData.firstRegMonth || null,
      first_reg_year: toNumberOrNull(carData.firstRegYear),
      technical_valid_until: carData.technicalValidUntil || null,
      owner_count: toNumberOrNull(carData.ownerCount),
      // Kamion specific
      airbag_count_kamion: toNumberOrNull(carData.airbagCountKamion),
      nosilnost: toNumberOrNull(carData.nosilnost),
      tovorni_prostor: toNumberOrNull(carData.tovorniProstor),
      zadnja_vrata: carData.zadnjaVrata || [],
      stranska_vrata: carData.stranskaVrata || [],
      barva_oblazinjenja: carData.barvaOblazinjenja || null,
      oblazinjenje: carData.oblazinjenje || null,
      streha_vozila: carData.strehaVozila || [],
      vin: carData.vin || null,
      // Tovorna prikolica specific
      dolzina: toNumberOrNull(carData.dolzina),
      sirina: toNumberOrNull(carData.sirina),
      stev_osi: toNumberOrNull(carData.stevOsi),
      dovoljena_skupna_tezza: toNumberOrNull(carData.dovoljenaSkupnaTezza),
      volumen: toNumberOrNull(carData.volumen),
      // UTV specific
      utv_engine_capacity: toNumberOrNull(carData.utvEngineCapacity),
      utv_engine_power_km: toNumberOrNull(carData.utvEnginePowerKm),
      utv_cylinder_count: toNumberOrNull(carData.utvCylinderCount),
      utv_engine_stroke: carData.utvEngineStroke || null,
      utv_diff_lock: carData.utvDiffLock || null,
      utv_start_type: carData.utvStartType || null,
      // Seller
      seller_name: carData.seller?.name || null,
      seller_phone: carData.seller?.phone || null,
      seller_username: carData.seller?.username || null,
      seller_profile_photo: carData.seller?.profile_photo || null,
      seller_user_type: carData.seller?.userType || null,
      seller_verified: carData.seller?.verified || false,
      // Status
      status: 'active',
      views: 0,
      featured: false,
      promoted: false,
      has_boost: false,
      boost_package: null,
      boost_days: null,
      boost_spent: 0,
      is_luxury_car: carData.isLuxuryCar || false,
      has_financing: carData.hasFinancing || false,
      monthly_budget: toNumberOrNull(carData.monthlyBudget),
      down_payment_type: carData.downPaymentType || null,
      down_payment_value: toNumberOrNull(carData.downPaymentValue),
    }
    
    const { data, error } = await supabase
      .from('cars')
      .insert(allData)
      .select()
      .single()
    
    if (error) {
      console.error('Error adding car to Supabase:', error)
      throw new Error(error.message || 'Failed to add car')
    }
    
    console.log('Car added to Supabase:', data)
    await loadCars()
    
    return { success: true, car: transformCarFromSupabase(data) }
  }

  const updateCar = async (carId, updates) => {
    if (!user) throw new Error('Must be logged in')
    
    const supabaseData = transformCarToSupabase(updates)
    
    const { data, error } = await supabase
      .from('cars')
      .update(supabaseData)
      .eq('id', carId)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating car in Supabase:', error)
      throw new Error(error.message || 'Failed to update car')
    }
    
    console.log('Car updated in Supabase:', data)
    await loadCars()
    
    return { success: true, car: transformCarFromSupabase(data) }
  }

  const deleteCar = async (carId) => {
    if (!user) throw new Error('Must be logged in')
    
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', carId)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error deleting car from Supabase:', error)
      throw new Error(error.message || 'Failed to delete car')
    }
    
    console.log('Car deleted from Supabase:', carId)
    await loadCars()
    
    return { success: true }
  }

  const value = {
    cars,
    myListings,
    loading,
    refreshCars,
    addCar,
    updateCar,
    deleteCar,
    addTestCar,
    getCarById: (id) => cars.find(c => c.id === id)
  }

  return (
    <CarContext.Provider value={value}>
      {children}
    </CarContext.Provider>
  )
}

export function useCars() {
  const context = useContext(CarContext)
  if (!context) {
    throw new Error('useCars must be used within a CarProvider')
  }
  return context
}
