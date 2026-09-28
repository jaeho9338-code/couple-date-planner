import { useState } from 'react'

const KEY = 'planner_profile'

export function useProfile() {
  const [profile, setProfileState] = useState(() => localStorage.getItem(KEY))

  const setProfile = (name) => {
    localStorage.setItem(KEY, name)
    setProfileState(name)
  }

  const clearProfile = () => {
    localStorage.removeItem(KEY)
    setProfileState(null)
  }

  return { profile, setProfile, clearProfile }
}
