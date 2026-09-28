import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase.js'

export function useBucketItems() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    supabase
      .from('bucket_items')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems(data ?? [])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    refresh()
    const channel = supabase
      .channel('bucket_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bucket_items' }, refresh)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [refresh])

  return { items, loading, refresh }
}
