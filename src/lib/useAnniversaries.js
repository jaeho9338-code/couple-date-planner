import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase.js'

export function useAnniversaries() {
  const [anniversaries, setAnniversaries] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    supabase
      .from('anniversaries')
      .select('*')
      .then(({ data }) => {
        setAnniversaries(data ?? [])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    refresh()
    const channel = supabase
      .channel('anniversaries_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anniversaries' }, refresh)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [refresh])

  return { anniversaries, loading, refresh }
}
