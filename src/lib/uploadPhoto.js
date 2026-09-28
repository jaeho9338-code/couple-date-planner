import { supabase } from './supabase.js'

const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.8

async function compressImage(file) {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
  if (!blob || blob.size >= file.size) return file
  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
}

export async function uploadPhotos(files) {
  const urls = []
  for (const file of files) {
    const compressed = await compressImage(file)
    const ext = compressed.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('date-photos').upload(path, compressed)
    if (error) throw error
    const { data } = supabase.storage.from('date-photos').getPublicUrl(path)
    urls.push(data.publicUrl)
  }
  return urls
}
