import Avatar from './Avatar.jsx'
import { displayName, avatarUrl } from '../lib/useProfiles.js'

export default function ProfilePicker({ onSelect, profiles }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        background: 'linear-gradient(160deg, var(--coral-400), var(--peach-300))',
        padding: 24,
      }}
    >
      <h1 style={{ color: '#fff', margin: 0 }}>둘 중에 누구예요? 💕</h1>
      <div style={{ display: 'flex', gap: 16 }}>
        {['A', 'B'].map((id) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="card"
            style={{
              width: 120,
              height: 120,
              border: 'none',
              fontSize: 16,
              fontWeight: 700,
              color: id === 'A' ? 'var(--blue-a)' : 'var(--pink-b)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Avatar id={id} url={avatarUrl(id, profiles)} size={48} />
            {displayName(id, profiles)}
          </button>
        ))}
      </div>
    </div>
  )
}
