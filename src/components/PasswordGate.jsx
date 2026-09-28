import { useState } from 'react'

const PASSWORD = '1234' // demo value
const KEY = 'planner_unlocked'

export function isUnlocked() {
  return localStorage.getItem(KEY) === 'true'
}

export default function PasswordGate({ onUnlock }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (value === PASSWORD) {
      localStorage.setItem(KEY, 'true')
      onUnlock()
    } else {
      setError(true)
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'linear-gradient(160deg, var(--coral-400), var(--peach-300))',
        padding: 24,
      }}
    >
      <span style={{ fontSize: 40 }}>🔐</span>
      <p style={{ color: '#fff', margin: 0, fontWeight: 700 }}>우리 둘만의 비밀번호</p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 260 }}>
        <input
          type="password"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(false)
          }}
          placeholder="비밀번호"
          autoFocus
          style={{
            padding: 14,
            borderRadius: 16,
            border: 'none',
            textAlign: 'center',
            fontSize: 18,
            letterSpacing: 4,
          }}
        />
        {error && <p style={{ color: '#fff', textAlign: 'center', margin: 0, fontSize: 13 }}>어라, 비밀번호가 아닌 것 같아요 🤔</p>}
        <button type="submit" className="pill" style={{ background: '#fff', color: 'var(--coral-500)' }}>
          들어가기 💕
        </button>
      </form>
    </div>
  )
}
