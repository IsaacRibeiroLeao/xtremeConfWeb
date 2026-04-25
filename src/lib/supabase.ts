import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Upload image to Supabase Storage and return the public URL
export async function uploadReceiptImage(file: File | Blob): Promise<string | null> {
  const fileName = `receipt_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
  
  const { error } = await supabase.storage
    .from('receipts')
    .upload(fileName, file, {
      contentType: 'image/jpeg',
      upsert: false
    })

  if (error) {
    console.error('Error uploading receipt:', error)
    return null
  }

  const { data: urlData } = supabase.storage
    .from('receipts')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

// Convert base64 to Blob for upload
export function base64ToBlob(base64: string): Blob {
  const parts = base64.split(',')
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(parts[1])
  const n = bstr.length
  const u8arr = new Uint8Array(n)
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i)
  }
  return new Blob([u8arr], { type: mime })
}
