import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase.js'

export function useDatePlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    supabase
      .from('date_plans')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPlans(data ?? [])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    refresh()
    const channel = supabase
      .channel('date_plans_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'date_plans' }, refresh)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [refresh])

  return { plans, loading, refresh }
}
