import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase.js'

export function useSchedules() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    supabase
      .from('schedules')
      .select('*')
      .order('date', { ascending: true })
      .then(({ data }) => {
        setSchedules(data ?? [])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    refresh()
    const channel = supabase
      .channel('schedules_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, refresh)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [refresh])

  return { schedules, loading, refresh }
}
