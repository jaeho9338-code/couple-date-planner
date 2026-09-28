import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { uploadPhotos } from '../lib/uploadPhoto.js'
import Avatar from './Avatar.jsx'
import { displayName } from '../lib/useProfiles.js'

export default function ProfileSettings({ profile, profiles, onClose, onSwitch }) {
  const current = profiles?.[profile]
  const otherId = profile === 'A' ? 'B' : 'A'
  const [nickname, setNickname] = useState(current?.nickname ?? '')
  const [avatarUrl, setAvatarUrl] = useState(current?.avatar_url ?? null)
  const [newFile, setNewFile] = useState(null)
  const [newFileUrl, setNewFileUrl] = useState(null)
  const [timetableUrl, setTimetableUrl] = useState(current?.timetable_url ?? null)
  const [newTimetableFile, setNewTimetableFile] = useState(null)
  const [newTimetableFileUrl, setNewTimetableFileUrl] = useState(null)
  const [timetableVisible, setTimetableVisible] = useState(current?.timetable_visible ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!newFile) return
    const url = URL.createObjectURL(newFile)
    setNewFileUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [newFile])

  useEffect(() => {
    if (!newTimetableFile) return
    const url = URL.createObjectURL(newTimetableFile)
    setNewTimetableFileUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [newTimetableFile])

  const preview = newFileUrl ?? avatarUrl
  const timetablePreview = newTimetableFileUrl ?? timetableUrl

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      let url = avatarUrl
      if (newFile) {
        const [uploaded] = await uploadPhotos([newFile])
        url = uploaded
      }
      let ttUrl = timetableUrl
      if (newTimetableFile) {
        const [uploaded] = await uploadPhotos([newTimetableFile])
        ttUrl = uploaded
      }
      await supabase
        .from('profiles')
        .update({ nickname: nickname || null, avatar_url: url, timetable_url: ttUrl, timetable_visible: timetableVisible })
        .eq('id', profile)
      onClose()
    } catch (err) {
      setError('저장에 실패했어요: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(43,35,32,0.35)', display: 'flex', alignItems: 'flex-end', zIndex: 30 }}
    >
      <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="card" style={{ width: '100%', borderRadius: '24px 24px 0 0', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, background: 'var(--gray-200)', borderRadius: 2, margin: '0 auto 4px' }} />
        <h2 style={{ margin: 0 }}>{displayName(profile, profiles)}는 어떤 모습일까요?</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar id={profile} url={preview} size={56} />
          <label className="pill" style={{ cursor: 'pointer' }}>
            사진 바꾸기
            <input type="file" accept="image/*" onChange={(e) => setNewFile(e.target.files[0])} style={{ display: 'none' }} />
          </label>
        </div>

        <label style={{ fontSize: 13, color: 'var(--ink-600)' }}>
          애칭
          <input
            type="text"
            name="planner-nickname"
            autoComplete="off"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={`예: 여봉, ${profile}이`}
            style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
          />
        </label>

        <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--ink-600)', margin: '0 0 8px' }}>내 시간표 사진 (선택)</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {timetablePreview ? (
              <img src={timetablePreview} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 12 }} />
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--cream-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                🗓️
              </div>
            )}
            <label className="pill" style={{ cursor: 'pointer' }}>
              {timetablePreview ? '사진 바꾸기' : '사진 올리기'}
              <input type="file" accept="image/*" onChange={(e) => setNewTimetableFile(e.target.files[0])} style={{ display: 'none' }} />
            </label>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-600)', marginTop: 10 }}>
            <input type="checkbox" checked={timetableVisible} onChange={(e) => setTimetableVisible(e.target.checked)} />
            {displayName(otherId, profiles)}에게 보여주기
          </label>
        </div>

        {error && <p style={{ color: 'var(--coral-500)', fontSize: 13, margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="pill" onClick={onClose} style={{ flex: 1 }}>
            취소
          </button>
          <button type="submit" className="pill active" style={{ flex: 2 }} disabled={saving}>
            {saving ? '저장하는 중...' : '저장하기'}
          </button>
        </div>
        <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', color: 'var(--ink-600)', fontSize: 13, textDecoration: 'underline', marginTop: 4 }}>
          나 사실 {displayName(otherId, profiles)}인데요?
        </button>
      </form>
    </div>
  )
}
