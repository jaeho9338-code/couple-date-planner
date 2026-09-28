import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase.js'

export function useProfiles() {
  const [profiles, setProfiles] = useState({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    supabase
      .from('profiles')
      .select('*')
      .then(({ data }) => {
        const map = {}
        for (const row of data ?? []) map[row.id] = row
        setProfiles(map)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    refresh()
    const channel = supabase
      .channel('profiles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, refresh)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [refresh])

  return { profiles, loading, refresh }
}

export function displayName(id, profiles) {
  return profiles?.[id]?.nickname || id
}

export function avatarUrl(id, profiles) {
  return profiles?.[id]?.avatar_url || null
}
