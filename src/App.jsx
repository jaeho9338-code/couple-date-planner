import { useState } from 'react'
import MapView from './components/MapView.jsx'
import KoreaMap from './components/KoreaMap.jsx'
import RecordsPage from './components/RecordsPage.jsx'
import PlannerPage from './components/PlannerPage.jsx'
import ExpensePage from './components/ExpensePage.jsx'
import RecommendBox from './components/RecommendBox.jsx'
import BucketListPage from './components/BucketListPage.jsx'
import ProfilePicker from './components/ProfilePicker.jsx'
import PasswordGate, { isUnlocked } from './components/PasswordGate.jsx'
import ProfileSettings from './components/ProfileSettings.jsx'
import Avatar from './components/Avatar.jsx'
import { useProfile } from './lib/useProfile.js'
import { useProfiles, displayName, avatarUrl } from './lib/useProfiles.js'

export default function App() {
  const [tab, setTab] = useState('busan')
  const [unlocked, setUnlocked] = useState(isUnlocked())
  const [showSettings, setShowSettings] = useState(false)
  const { profile, setProfile, clearProfile } = useProfile()
  const { profiles, loading: profilesLoading } = useProfiles()

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />
  }

  if (profilesLoading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: 120, height: 120, borderRadius: '50%' }} />
      </div>
    )
  }

  if (!profile) {
    return <ProfilePicker onSelect={setProfile} profiles={profiles} />
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
          gap: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          <button className={`pill ${tab === 'busan' ? 'active' : ''}`} onClick={() => setTab('busan')}>
            홈
          </button>
          <button className={`pill ${tab === 'korea' ? 'active' : ''}`} onClick={() => setTab('korea')}>
            전국
          </button>
          <button className={`pill ${tab === 'records' ? 'active' : ''}`} onClick={() => setTab('records')}>
            기록
          </button>
          <button className={`pill ${tab === 'planner' ? 'active' : ''}`} onClick={() => setTab('planner')}>
            플래너
          </button>
          <button className={`pill ${tab === 'bucket' ? 'active' : ''}`} onClick={() => setTab('bucket')}>
            버킷리스트
          </button>
          <button className={`pill ${tab === 'expense' ? 'active' : ''}`} onClick={() => setTab('expense')}>
            가계부
          </button>
          <button className={`pill ${tab === 'recommend' ? 'active' : ''}`} onClick={() => setTab('recommend')}>
            추천
          </button>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="pill"
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Avatar id={profile} url={avatarUrl(profile, profiles)} size={18} />
          {displayName(profile, profiles)}
        </button>
      </div>
      {tab === 'busan' && <MapView profile={profile} profiles={profiles} />}
      {tab === 'korea' && <KoreaMap profile={profile} profiles={profiles} />}
      {tab === 'records' && <RecordsPage profile={profile} profiles={profiles} />}
      {tab === 'planner' && <PlannerPage profile={profile} profiles={profiles} />}
      {tab === 'bucket' && <BucketListPage profile={profile} />}
      {tab === 'expense' && <ExpensePage profile={profile} />}
      {tab === 'recommend' && <RecommendBox />}

      {showSettings && (
        <ProfileSettings
          profile={profile}
          profiles={profiles}
          onClose={() => setShowSettings(false)}
          onSwitch={() => {
            setShowSettings(false)
            clearProfile()
          }}
        />
      )}
    </div>
  )
}
