import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ============ IMAGE STORAGE HELPERS ============

// Generate unique file name
const generateFileName = (originalName, carId, index) => {
  const ext = originalName.split('.').pop()
  return `${carId}_${index}_${Date.now()}.${ext}`
}

// Upload single image to Supabase Storage
export const uploadImageToStorage = async (file, carId, index = 0) => {
  try {
    const fileName = generateFileName(file.name, carId, index)
    const filePath = `cars/${carId}/${fileName}`
    
    const { data, error } = await supabase.storage
      .from('car-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('Supabase storage upload error:', error)
      throw error
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('car-images')
      .getPublicUrl(filePath)
    
    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// Upload multiple images to Supabase Storage
export const uploadImagesToStorage = async (files, carId) => {
  if (!files || files.length === 0) return []
  
  const uploadPromises = files.map((file, index) => 
    uploadImageToStorage(file, carId, index)
  )
  
  try {
    const urls = await Promise.all(uploadPromises)
    return urls
  } catch (error) {
    console.error('Error uploading images:', error)
    throw error
  }
}

// Delete image from Supabase Storage
export const deleteImageFromStorage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('car-images')) return
    
    // Extract path from URL
    const urlParts = imageUrl.split('/car-images/')
    if (urlParts.length < 2) return
    
    const filePath = `car-images/${urlParts[1]}`
    
    const { error } = await supabase.storage
      .from('car-images')
      .remove([filePath])
    
    if (error) {
      console.error('Error deleting image:', error)
    }
  } catch (error) {
    console.error('Error deleting image:', error)
  }
}

// Delete all images for a car
export const deleteCarImagesFromStorage = async (carId) => {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from('car-images')
      .list(`cars/${carId}/`)
    
    if (listError) {
      console.error('Error listing images:', listError)
      return
    }
    
    if (files && files.length > 0) {
      const pathsToDelete = files.map(f => `cars/${carId}/${f.name}`)
      
      const { error: deleteError } = await supabase.storage
        .from('car-images')
        .remove(pathsToDelete)
      
      if (deleteError) {
        console.error('Error deleting images:', deleteError)
      }
    }
  } catch (error) {
    console.error('Error deleting car images:', error)
  }
}

// Convert File to base64 (fallback method)
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

// Check if image URL is from Supabase Storage or base64
export const isSupabaseStorageUrl = (url) => {
  return url && url.includes('car-images') && url.includes('supabase')
}

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseKey)
}
