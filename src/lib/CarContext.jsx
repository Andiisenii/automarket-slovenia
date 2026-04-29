import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from './supabase'

const CarContext = createContext(null)

export function CarProvider({ children }) {
  const { user } = useAuth()
  const [cars, setCars] = useState([])
  const [myListings, setMyListings] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch all cars when user changes
  useEffect(() => {
    loadCars()
  }, [user])

  const loadCars = async () => {
    setLoading(true)
    try {
      // Get all public cars from Supabase
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading cars from Supabase:', error)
        // Fallback to localStorage
        const localCars = JSON.parse(localStorage.getItem('automarket_cars') || '[]')
        setCars(localCars)
        if (user?.id) {
          const myCars = localCars.filter(c => c.userId === user.id)
          setMyListings(myCars)
        }
      } else {
        console.log('Cars loaded from Supabase:', data?.length)
        // Transform Supabase data to app format
        const transformedCars = (data || []).map(transformCarFromSupabase)
        setCars(transformedCars)
        
        // Get user's own cars if logged in
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
    // Convert camelCase to snake_case for Supabase
    return {
      user_id: carData.userId,
      vehicle_category: carData.vehicleCategory,
      vehicle_sub_category: carData.vehicleSubCategory,
      vehicle_sub_category_detail: carData.vehicleSubCategoryDetail,
      brand: carData.brand,
      model: carData.model,
      year: carData.year,
      price: carData.price,
      mileage: carData.mileage,
      fuel_type: carData.fueltype || carData.fuelType,
      transmission: carData.transmission,
      body_type: carData.bodytype || carData.bodyType,
      engine: carData.engine,
      horsepower: carData.horsepower,
      color: carData.color,
      city: carData.city,
      description: carData.description,
      vehicle_condition: carData.vehicleCondition,
      vehicle_condition_sub: carData.vehicleConditionSub,
      images: carData.images,
      feature_ids: carData.featureIds,
      fuel_consumption: carData.fuelConsumption,
      emission_class: carData.emissionClass,
      co2_emissions: carData.co2Emissions,
      auto_publish_fuel_data: carData.autoPublishFuelData,
      vehicle_age: carData.vehicleAge,
      has_warranty: carData.hasWarranty,
      has_guarantee: carData.hasGuarantee,
      has_oldtimer_cert: carData.hasOldtimerCert,
      first_reg_month: carData.firstRegMonth,
      first_reg_year: carData.firstRegYear,
      technical_valid_until: carData.technicalValidUntil,
      owner_count: carData.ownerCount,
      engine_capacity: carData.engineCapacity,
      engine_power_kw: carData.enginePowerKw,
      cylinder_count: carData.cylinderCount,
      engine_stroke: carData.engineStroke,
      diff_lock: carData.diffLock,
      start_type: carData.startType,
      airbag_count_kamion: carData.airbagCountKamion,
      nosilnost: carData.nosilnost,
      tovorni_prostor: carData.tovorniProstor,
      zadnja_vrata: carData.zadnjaVrata,
      stranska_vrata: carData.stranskaVrata,
      barva_oblazinjenja: carData.barvaOblazinjenja,
      oblazinjenje: carData.oblazinjenje,
      streha_vozila: carData.strehaVozila,
      vin: carData.vin,
      dolzina: carData.dolzina,
      sirina: carData.sirina,
      stev_osi: carData.stevOsi,
      dovoljena_skupna_tezza: carData.dovoljenaSkupnaTezza,
      volumen: carData.volumen,
      utv_engine_capacity: carData.utvEngineCapacity,
      utv_engine_power_km: carData.utvEnginePowerKm,
      utv_cylinder_count: carData.utvCylinderCount,
      utv_engine_stroke: carData.utvEngineStroke,
      utv_diff_lock: carData.utvDiffLock,
      utv_start_type: carData.utvStartType,
      seller_name: carData.seller?.name,
      seller_phone: carData.seller?.phone,
      seller_user_type: carData.seller?.userType,
      seller_verified: carData.seller?.verified,
      views: carData.views || 0,
      status: carData.status || 'active',
      has_boost: carData.hasBoost,
      boost_package: carData.boostPackage,
      boost_days: carData.boostDays,
      boost_spent: carData.boostSpent,
      is_featured: carData.featured,
      is_promoted: carData.promoted,
      is_luxury_car: carData.isLuxuryCar,
      has_financing: carData.hasFinancing,
      monthly_budget: carData.monthlyBudget,
      down_payment_type: carData.downPaymentType,
      down_payment_value: carData.downPaymentValue,
    }
  }

  const transformCarFromSupabase = (dbCar) => {
    // Convert snake_case from Supabase to camelCase for app
    return {
      id: dbCar.id,
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

  const addCar = async (carData) => {
    if (!user) throw new Error('Must be logged in to add a car')
    
    const supabaseData = transformCarToSupabase(carData)
    
    const { data, error } = await supabase
      .from('cars')
      .insert(supabaseData)
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
