import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const app = express()
app.use(cors())
app.use(express.json())

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// ============ AUTH ============
app.post('/api/auth.php', async (req, res) => {
  const { action, email, password, name, phone, role, userType } = req.body

  if (action === 'login') {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error || !data) {
      return res.json({ success: false, message: 'Invalid credentials' })
    }
    
    const validPassword = await bcrypt.compare(password, data.password)
    if (!validPassword) {
      return res.json({ success: false, message: 'Invalid credentials' })
    }
    
    const token = 'auth_' + Date.now()
    return res.json({
      success: true,
      user: { id: data.id, name: data.name, email: data.email, role: data.role },
      token
    })
  }

  if (action === 'register') {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
    
    if (existing) {
      return res.json({ success: false, message: 'Email already exists' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        phone: phone || '',
        password: hashedPassword,
        role: role || 'buyer',
        user_type: userType || 'private'
      })
      .select()
      .single()
    
    if (error) {
      return res.json({ success: false, message: error.message })
    }
    
    const token = 'auth_' + Date.now()
    return res.json({
      success: true,
      user: { id: data.id, name: data.name, email: data.email, role: data.role },
      token
    })
  }
})

// ============ FORGOT PASSWORD ============
app.post('/api/forgot-password.php', async (req, res) => {
  const { email } = req.body
  
  if (!email) {
    return res.json({ success: false, message: 'Email is required' })
  }
  
  // Check if user exists
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', email)
    .single()
  
  if (error || !user) {
    // Don't reveal if email exists or not for security
    return res.json({ success: true, message: 'If an account exists, a reset code has been sent' })
  }
  
  // Generate 6-digit reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
  
  // Store reset code with expiry (15 minutes)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
  
  await supabase
    .from('users')
    .update({ 
      reset_code: resetCode,
      reset_expires_at: expiresAt
    })
    .eq('id', user.id)
  
  // In production, send email here. For now, log to console.
  console.log(`Password reset code for ${email}: ${resetCode}`)
  
  return res.json({ 
    success: true, 
    message: 'If an account exists, a reset code has been sent',
    // For demo purposes, include the code in response (remove in production!)
    demo_code: resetCode 
  })
})

app.post('/api/reset-password.php', async (req, res) => {
  const { email, token, newPassword } = req.body
  
  if (!email || !token || !newPassword) {
    return res.json({ success: false, message: 'All fields are required' })
  }
  
  if (newPassword.length < 6) {
    return res.json({ success: false, message: 'Password must be at least 6 characters' })
  }
  
  // Find user with matching reset code and non-expired code
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .eq('reset_code', token)
    .single()
  
  if (error || !user) {
    return res.json({ success: false, message: 'Invalid or expired reset code' })
  }
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  
  // Update password and clear reset code
  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      password: hashedPassword,
      reset_code: null,
      reset_expires_at: null
    })
    .eq('id', user.id)
  
  if (updateError) {
    return res.json({ success: false, message: 'Failed to reset password' })
  }
  
  return res.json({ success: true, message: 'Password reset successfully' })
})

// ============ CARS ============
app.get('/api/cars.php', async (req, res) => {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    return res.json({ success: false, message: error.message })
  }
  return res.json({ success: true, cars: data || [] })
})

app.post('/api/cars.php', async (req, res) => {
  const { user_id, ...carData } = req.body
  
  const { data, error } = await supabase
    .from('cars')
    .insert({ ...carData, user_id })
    .select()
    .single()
  
  if (error) {
    return res.json({ success: false, message: error.message })
  }
  return res.json({ success: true, car: data })
})

app.put('/api/cars.php', async (req, res) => {
  const { id, ...carData } = req.body
  
  const { data, error } = await supabase
    .from('cars')
    .update(carData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    return res.json({ success: false, message: error.message })
  }
  return res.json({ success: true, car: data })
})

app.delete('/api/cars.php', async (req, res) => {
  const { id } = req.body
  
  const { error } = await supabase
    .from('cars')
    .delete()
    .eq('id', id)
  
  if (error) {
    return res.json({ success: false, message: error.message })
  }
  return res.json({ success: true })
})

// ============ PACKAGES ============
app.get('/api/packages.php', async (req, res) => {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  
  if (error) {
    return res.json({ success: false, message: error.message })
  }
  return res.json({ success: true, packages: data || [] })
})

// ============ ADMIN ============
app.get('/api/admin.php', async (req, res) => {
  const { action } = req.query
  
  if (action === 'users') {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    return res.json({ success: true, users: data || [] })
  }
  
  if (action === 'cars') {
    const { data } = await supabase
      .from('cars')
      .select('*, users:name(name)')
      .order('created_at', { ascending: false })
    return res.json({ success: true, cars: data || [] })
  }
  
  if (action === 'packages') {
    const { data } = await supabase.from('packages').select('*').order('sort_order')
    
    // Organize by type
    const result = {
      publishing: [],
      boost: { private: [], business: [] }
    }
    
    if (data) {
      data.forEach(pkg => {
        if (pkg.type === 'publishing') result.publishing.push(pkg)
        else if (pkg.type === 'boost_private') result.boost.private.push(pkg)
        else if (pkg.type === 'boost_business') result.boost.business.push(pkg)
      })
    }
    
    return res.json({ success: true, packages: result })
  }
  
  if (action === 'analytics') {
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const { count: totalCars } = await supabase.from('cars').select('*', { count: 'exact', head: true })
    
    return res.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalCars: totalCars || 0,
        activeCars: totalCars || 0,
        totalRevenue: 0
      }
    })
  }
  
  return res.json({ success: false, message: 'Unknown action' })
})

app.post('/api/admin.php', async (req, res) => {
  const { action } = req.query
  const input = req.body
  
  if (action === 'update_package') {
    const { id, name, name_en, price, min_days, discount, discount_active } = input
    
    const { data, error } = await supabase
      .from('packages')
      .update({
        name,
        name_en,
        price,
        min_days,
        discount_percent: discount,
        discount_active
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      return res.json({ success: false, message: error.message })
    }
    return res.json({ success: true, message: 'Package updated' })
  }
  
  return res.json({ success: false, message: 'Unknown action' })
})

// ============ CAR FEATURES ============
app.get('/api/features.php', async (req, res) => {
  const { data, error } = await supabase
    .from('car_features')
    .select('*')
    .eq('is_active', true)
    .order('category')
  
  if (error) {
    return res.json({ success: false, message: error.message })
  }
  
  // Group by category
  const grouped = {}
  if (data) {
    data.forEach(feature => {
      if (!grouped[feature.category]) {
        grouped[feature.category] = []
      }
      grouped[feature.category].push(feature)
    })
  }
  
  return res.json({ success: true, features: data || [], grouped })
})

// ============ BRANDS ============
app.get('/api/brands.php', async (req, res) => {
  const brands = [
    'Audi', 'BMW', 'Citroën', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Kia',
    'Mazda', 'Mercedes-Benz', 'Nissan', 'Opel', 'Peugeot', 'Renault',
    'Seat', 'Škoda', 'Toyota', 'Volkswagen', 'Volvo', 'Tesla', 'Polestar'
  ]
  return res.json({ success: true, brands })
})

// ============ CITIES ============
app.get('/api/cities.php', async (req, res) => {
  const cities = [
    'Ajdovščina', 'Bled', 'Borovnica', 'Brežice', 'Celje', 'Cerknica',
    'Črnomelj', 'Domžale', 'Gornja Radgona', 'Grosuplje', 'Hrastnik',
    'Idrija', 'Ilirska Bistrica', 'Izola', 'Jesenice', 'Kamnik',
    'Koper', 'Kranj', 'Krapina', 'Krško', 'Laško', 'Lenart', 'Lendava',
    'Ljubljana', 'Ljutomer', 'Logatec', 'Maribor', 'Metlika', 'Murska Sobota',
    'Nova Gorica', 'Novo Mesto', 'Ormož', 'Piran', 'Postojna', 'Prevalje',
    'Ptuj', 'Radovljica', 'Ravne na Koroškem', 'Ribnica', 'Rogatec',
    'Sežana', 'Slovenj Gradec', 'Slovenske Konjice', 'Šmarje pri Jelšah',
    'Tolmin', 'Trbovlje', 'Trebnje', 'Tržič', 'Velenje', 'Vipava',
    'Vodice', 'Vrhnika', 'Zagorje ob Savi', 'Žalec', 'Zreče'
  ]
  return res.json({ success: true, cities })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
