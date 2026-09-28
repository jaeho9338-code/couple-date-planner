import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase.js'

export function useDateLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    supabase
      .from('date_logs')
      .select('*, location_preset:location_presets(name)')
      .order('date', { ascending: false })
      .then(({ data }) => {
        setLogs(data ?? [])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    refresh()
    const channel = supabase
      .channel('date_logs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'date_logs' }, refresh)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [refresh])

  return { logs, loading, refresh }
}
